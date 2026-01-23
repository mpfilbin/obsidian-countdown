import { CountdownSettingTab } from '../../src/components/settings-tab';
import { createMockElement, MockHTMLElement } from '../__mocks__/obsidian';

/**
 * Helper to find all elements with a specific tag in the element tree
 */
function findAllByTag(element: MockHTMLElement, tagName: string): MockHTMLElement[] {
  const results: MockHTMLElement[] = [];
  if (element.tagName === tagName.toUpperCase()) {
    results.push(element);
  }
  for (const child of element.children) {
    results.push(...findAllByTag(child, tagName));
  }
  return results;
}

/**
 * Helper to find all elements with a specific class in the element tree
 */
function findAllByClass(element: MockHTMLElement, className: string): MockHTMLElement[] {
  const results: MockHTMLElement[] = [];
  if (element.className.includes(className)) {
    results.push(element);
  }
  for (const child of element.children) {
    results.push(...findAllByClass(child, className));
  }
  return results;
}

/**
 * Helper to get all text content from an element tree
 */
function getAllText(element: MockHTMLElement): string {
  let text = element.textContent;
  for (const child of element.children) {
    text += ' ' + getAllText(child);
  }
  return text;
}

describe('CountdownSettingTab', () => {
  let settingTab: CountdownSettingTab;
  let containerEl: MockHTMLElement;

  beforeEach(() => {
    const mockApp = {};
    const mockPlugin = {};
    settingTab = new CountdownSettingTab(mockApp as never, mockPlugin as never);
    containerEl = settingTab.containerEl;
  });

  describe('display', () => {
    beforeEach(() => {
      settingTab.display();
    });

    it('should clear existing content before rendering', () => {
      const initialChildCount = containerEl.children.length;

      settingTab.display();

      // Should have same number of children (cleared and re-rendered)
      expect(containerEl.children.length).toBe(initialChildCount);
    });

    it('should render the main heading', () => {
      const headings = findAllByTag(containerEl, 'h1');

      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(headings[0].textContent).toBe('Countdown Timer');
    });

    it('should render an Examples section', () => {
      const h2s = findAllByTag(containerEl, 'h2');
      const examplesHeading = h2s.find((h) => h.textContent === 'Examples');

      expect(examplesHeading).toBeDefined();
    });

    it('should render example code blocks', () => {
      const codeBlocks = findAllByClass(containerEl, 'countdown-example-code');

      expect(codeBlocks.length).toBeGreaterThanOrEqual(1);
    });

    it('should render examples with countdown code fence syntax', () => {
      const codeBlocks = findAllByClass(containerEl, 'countdown-example-code');
      const allCodeText = codeBlocks.map((block) => getAllText(block)).join(' ');

      expect(allCodeText).toContain('```countdown');
      expect(allCodeText).toContain('title:');
    });

    it('should render examples covering target dates', () => {
      const codeBlocks = findAllByClass(containerEl, 'countdown-example-code');
      const allCodeText = codeBlocks.map((block) => getAllText(block)).join(' ');

      expect(allCodeText).toContain('target:');
    });

    it('should render examples covering durations', () => {
      const codeBlocks = findAllByClass(containerEl, 'countdown-example-code');
      const allCodeText = codeBlocks.map((block) => getAllText(block)).join(' ');

      expect(allCodeText).toContain('duration:');
    });

    it('should render examples covering custom formats', () => {
      const codeBlocks = findAllByClass(containerEl, 'countdown-example-code');
      const allCodeText = codeBlocks.map((block) => getAllText(block)).join(' ');

      expect(allCodeText).toContain('format:');
    });

    it('should render a Configuration Reference section', () => {
      const h2s = findAllByTag(containerEl, 'h2');
      const configHeading = h2s.find((h) => h.textContent === 'Configuration Reference');

      expect(configHeading).toBeDefined();
    });

    it('should render configuration options table', () => {
      const tables = findAllByClass(containerEl, 'countdown-settings-table');

      expect(tables.length).toBeGreaterThanOrEqual(1);
    });

    it('should document all configuration options', () => {
      const allText = getAllText(containerEl);

      expect(allText).toContain('title');
      expect(allText).toContain('target');
      expect(allText).toContain('duration');
      expect(allText).toContain('format');
    });

    it('should render a Format Codes section', () => {
      const h3s = findAllByTag(containerEl, 'h3');
      const formatHeading = h3s.find((h) => h.textContent === 'Format Codes');

      expect(formatHeading).toBeDefined();
    });

    it('should document all format codes', () => {
      const allText = getAllText(containerEl);

      expect(allText).toContain('%d');
      expect(allText).toContain('%H');
      expect(allText).toContain('%M');
      expect(allText).toContain('%S');
      expect(allText).toContain('%%');
    });

    it('should include note about %H behavior when %d is omitted', () => {
      const notes = findAllByClass(containerEl, 'countdown-settings-note');

      expect(notes.length).toBeGreaterThanOrEqual(1);
      const noteText = notes.map((n) => n.textContent).join(' ');
      expect(noteText).toContain('%d');
      expect(noteText).toContain('hours');
    });
  });
});
