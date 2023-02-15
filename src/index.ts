#!/usr/bin/env node
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItem,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  CompletionItemKind,
  HoverParams,
  Hover,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import Context from './context';
import { runHover, runCompletion } from './actions';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => ({
  capabilities: {
    // Incremental file updates are sent.
    textDocumentSync: TextDocumentSyncKind.Incremental,
    // Tell the client that this server supports code completion.
    completionProvider: {
      triggerCharacters: 'abcdefghijklmnopqrstuvwxyz/-_"'.split(''),
    },
    hoverProvider: true,
  },
}));

connection.onHover(
  async ({
    textDocument: file,
    position,
  }: HoverParams): Promise<Hover | undefined> => {
    if (!file.uri.endsWith('composer.json')) return;

    const document = documents.get(file.uri);
    if (!document) return;

    const context = Context.fromLSP(document, position, connection);
    const result = await runHover(context);
    if (!result) return;

    return {
      contents: result,
    };
  }
);

connection.onCompletion(
  async ({
    textDocument: file,
    position,
  }: TextDocumentPositionParams): Promise<CompletionItem[] | undefined> => {
    if (!file.uri.endsWith('composer.json')) return;

    const document = documents.get(file.uri);
    if (!document) return;

    const context = Context.fromLSP(document, position, connection);
    const results = await runCompletion(context);

    return results.map((result) => ({
      label: result.name,
      kind: CompletionItemKind.Module,
      documentation: result.description,
    }));
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
