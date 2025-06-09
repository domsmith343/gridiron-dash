// src/utils/styleUtils.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateTeamColorClassName,
  generateTeamColorCss,
  injectTeamColorStyles,
  generateGlobalTeamColorsCss,
  applyTeamColors
} from './styleUtils';

describe('styleUtils', () => {
  describe('generateTeamColorClassName', () => {
    it('should generate a class name with default colors if none provided', () => {
      expect(generateTeamColorClassName(undefined, undefined)).toBe('team-colors-333-333');
    });

    it('should generate a class name with provided colors', () => {
      expect(generateTeamColorClassName('#FF0000', '#00FF00')).toBe('team-colors-FF0000-00FF00');
    });

    it('should use default for one color if only one is provided', () => {
      expect(generateTeamColorClassName('#ABCDEF', undefined)).toBe('team-colors-ABCDEF-333');
      expect(generateTeamColorClassName(undefined, '#123456')).toBe('team-colors-333-123456');
    });
  });

  describe('generateTeamColorCss', () => {
    it('should generate correct CSS string', () => {
      const className = 'test-class';
      const homeColor = '#FF0000';
      const awayColor = '#00FF00';
      const css = generateTeamColorCss(className, homeColor, awayColor);
      
      expect(css).toContain(`.${className} {`);
      expect(css).toContain(`--home-team-color: ${homeColor};`);
      expect(css).toContain(`--away-team-color: ${awayColor};`);
      expect(css).toContain(`.${className} .home-team-color { --team-color: ${homeColor}; }`);
      expect(css).toContain(`.${className} .away-team-color { --team-color: ${awayColor}; }`);
    });

    it('should use default colors in CSS if none provided', () => {
      const className = 'test-class-defaults';
      const css = generateTeamColorCss(className, undefined, undefined);
      expect(css).toContain('--home-team-color: #333;');
      expect(css).toContain('--away-team-color: #333;');
      expect(css).toContain(`.${className} .home-team-color { --team-color: #333; }`);
      expect(css).toContain(`.${className} .away-team-color { --team-color: #333; }`);
    });
  });

  describe('injectTeamColorStyles', () => {
    beforeEach(() => {
      // Ensure document.head is clean before each test and spies are reset
      document.head.innerHTML = '';
      vi.spyOn(document.head, 'appendChild').mockClear();
      vi.spyOn(document, 'getElementById').mockClear().mockImplementation((id: string) => {
        // Basic mock for getElementById to find elements created in the test
        for (const child of Array.from(document.head.children)) {
          if (child.id === id) return child as HTMLElement;
        }
        return null;
      });
    });

    it('should append style element to head if not already present', () => {
      const home = '#111111';
      const away = '#222222';
      const expectedClassName = generateTeamColorClassName(home, away);
      
      const className = injectTeamColorStyles(home, away);
      expect(className).toBe(expectedClassName);
      expect(document.getElementById).toHaveBeenCalledWith(expectedClassName);
      expect(document.head.appendChild).toHaveBeenCalledOnce();
      
      const styleElement = document.getElementById(expectedClassName);
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
      expect(styleElement?.innerHTML).toContain(`--home-team-color: ${home};`);
      expect(styleElement?.innerHTML).toContain(`--away-team-color: ${away};`);
    });

    it('should not append style element if already present', () => {
      const home = '#333333';
      const away = '#444444';
      const expectedClassName = generateTeamColorClassName(home, away);

      injectTeamColorStyles(home, away); // First call
      expect(document.head.appendChild).toHaveBeenCalledTimes(1);
      vi.mocked(document.head.appendChild).mockClear(); // Clear call count for the next assertion

      injectTeamColorStyles(home, away); // Second call with same colors
      expect(document.head.appendChild).not.toHaveBeenCalled(); 
    });
  });

  describe('generateGlobalTeamColorsCss', () => {
    it('should generate correct global CSS string', () => {
      const homeColor = '#AA0000';
      const awayColor = '#00AA00';
      const css = generateGlobalTeamColorsCss(homeColor, awayColor);
      expect(css).toContain(`:root {`);
      expect(css).toContain(`--home-team-color: ${homeColor};`);
      expect(css).toContain(`--away-team-color: ${awayColor};`);
    });

    it('should use default colors if none provided', () => {
      const css = generateGlobalTeamColorsCss(undefined, undefined);
      expect(css).toContain('--home-team-color: #333;');
      expect(css).toContain('--away-team-color: #333;');
    });
  });

  describe('applyTeamColors', () => {
    const styleId = 'team-colors-global';

    beforeEach(() => {
      document.head.innerHTML = '';
      vi.spyOn(document.head, 'appendChild').mockClear();
      vi.spyOn(document, 'getElementById').mockClear().mockImplementation((id: string) => {
        for (const child of Array.from(document.head.children)) {
          if (child.id === id) return child as HTMLElement;
        }
        return null;
      });
    });

    it('should create and append style element if not present', () => {
      applyTeamColors('#CCCCCC', '#DDDDDD');
      expect(document.getElementById).toHaveBeenCalledWith(styleId);
      expect(document.head.appendChild).toHaveBeenCalledOnce();
      
      const styleElement = document.getElementById(styleId);
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
      expect(styleElement?.innerHTML).toContain('--home-team-color: #CCCCCC;');
      expect(styleElement?.innerHTML).toContain('--away-team-color: #DDDDDD;');
    });

    it('should update existing style element if present', () => {
      // Initial setup: create the element so it's found by getElementById
      const initialStyleElement = document.createElement('style');
      initialStyleElement.id = styleId;
      document.head.appendChild(initialStyleElement);
      // Reset appendChild spy after this initial setup append
      vi.mocked(document.head.appendChild).mockClear();
      
      applyTeamColors('#AAAAAA', '#BBBBBB');
      
      expect(document.getElementById).toHaveBeenCalledWith(styleId);
      expect(document.head.appendChild).not.toHaveBeenCalled(); 
      
      const styleElement = document.getElementById(styleId);
      expect(styleElement).not.toBeNull();
      expect(styleElement?.innerHTML).toContain('--home-team-color: #AAAAAA;');
      expect(styleElement?.innerHTML).toContain('--away-team-color: #BBBBBB;');
    });
  });
});
