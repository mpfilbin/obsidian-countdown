// Mock for Obsidian API used in tests

export class Notice {
  constructor(public message: string) {}
}

/**
 * Mock HTML element that tracks created children for testing
 */
export interface MockHTMLElement {
  tagName: string;
  textContent: string;
  className: string;
  children: MockHTMLElement[];
  empty: () => void;
  createEl: (tag: string, options?: { text?: string; cls?: string }) => MockHTMLElement;
  addClass: (cls: string) => void;
}

export function createMockElement(tagName: string = 'div'): MockHTMLElement {
  const element: MockHTMLElement = {
    tagName: tagName.toUpperCase(),
    textContent: '',
    className: '',
    children: [],
    empty: function () {
      this.children = [];
      this.textContent = '';
    },
    createEl: function (tag: string, options?: { text?: string; cls?: string }): MockHTMLElement {
      const child = createMockElement(tag);
      if (options?.text) child.textContent = options.text;
      if (options?.cls) child.className = options.cls;
      this.children.push(child);
      return child;
    },
    addClass: function (cls: string) {
      this.className = this.className ? `${this.className} ${cls}` : cls;
    },
  };
  return element;
}

export class PluginSettingTab {
  app: unknown;
  plugin: unknown;
  containerEl: MockHTMLElement;

  constructor(app: unknown, plugin: unknown) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = createMockElement('div');
  }

  display(): void {}
  hide(): void {}
}

export class Setting {
  nameText: string = '';
  descText: string = '';

  constructor(private readonly containerEl: MockHTMLElement) {}

  setName(name: string): this {
    this.nameText = name;
    return this;
  }

  setDesc(desc: string): this {
    this.descText = desc;
    return this;
  }
}
