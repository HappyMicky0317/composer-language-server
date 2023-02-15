import { Position as LspPosition, Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  Node,
  getLocation,
  findNodeAtOffset,
  parseTree,
  Location,
} from 'jsonc-parser';
import { inspect } from 'util';

export interface Position {
  line: number;
  character: number;
  offset: number;
}

export type LoggerFunction = (message: any, ...optionalParams: any[]) => void;

export interface Logger {
  info: LoggerFunction;
  warn: LoggerFunction;
  error: LoggerFunction;
}

/**
 * An instance of context is passed to all actions,
 * it contains functionality for the user's current position.
 */
export default class Context {
  /**
   * Get the parsed AST tree, cached with a getter as it parses the document (heavy).
   */
  private _tree: Node | undefined;
  public get tree(): Node {
    if (!this._tree) {
      this._tree = parseTree(this.content);
    }

    return this._tree!;
  }

  /**
   * Get the current location context, cached with a getter as it parses the document (heavy).
   */
  private _location: Location | undefined;
  public get location(): Location {
    if (!this._location) {
      this._location = getLocation(this.content, this.position.offset);
    }

    return this._location;
  }

  public constructor(
    public readonly content: string,
    public readonly position: Position,
    public readonly logger: Logger
  ) {}

  /**
   * Creates a context from the LSP provided variables.
   */
  public static fromLSP(
    document: TextDocument,
    position: LspPosition,
    connection: Connection
  ): Context {
    const offset = document.offsetAt(position);
    return new Context(
      document.getText(),
      { ...position, offset },
      connection.console
    );
  }

  /**
   * Whether the current locations is in a require or require-dev block.
   */
  public isDefiningDependencies(): boolean {
    return (
      ['require', 'require-dev'].includes(this.location.path[0].toString()) &&
      this.location.path.length === 2
    );
  }

  /**
   * Whether the user is currently at a property key.
   */
  public isAtPropertyKey(): boolean {
    const currentNode = this.getCurrentNode();
    this.logger.info(inspect(currentNode));
    if (currentNode?.type === 'string') {
      return currentNode.parent?.children?.[0] === currentNode;
    }

    return currentNode?.type === 'property' && !!currentNode?.children?.length;
  }

  /**
   * Returns the value of the current line's key.
   */
  public getCurrentKeyValue(): string | undefined {
    if (!this.isAtPropertyKey) return;

    const currentNode = this.getCurrentNode();

    const property =
      currentNode?.type === 'string' ? currentNode.parent : currentNode;
    return property?.children?.[0].value ?? undefined;
  }

  /**
   * Returns the node at the current offset.
   */
  public getCurrentNode(): Node | undefined {
    return findNodeAtOffset(this.tree, this.position.offset);
  }
}
