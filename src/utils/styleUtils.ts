// src/utils/styleUtils.ts

// Pure function to generate the class name
export const generateTeamColorClassName = (
  homeTeamColor: string | undefined,
  awayTeamColor: string | undefined
): string => {
  const homeColor = homeTeamColor || '#333';
  const awayColor = awayTeamColor || '#333';
  return `team-colors-${homeColor.replace('#', '')}-${awayColor.replace('#', '')}`;
};

// Pure function to generate the style string
export const generateTeamColorCss = (
  className: string,
  homeTeamColor: string | undefined,
  awayTeamColor: string | undefined
): string => {
  const homeColor = homeTeamColor || '#333';
  const awayColor = awayTeamColor || '#333';
  return `
      .${className} {
        --home-team-color: ${homeColor};
        --away-team-color: ${awayColor};
      }
      
      .${className} .home-team-color {
        --team-color: ${homeColor};
      }
      
      .${className} .away-team-color {
        --team-color: ${awayColor};
      }
    `;
};

// Function with side effects (DOM manipulation)
// Renamed from createTeamColorStyles to injectTeamColorStyles to better reflect its action
export const injectTeamColorStyles = (
  homeTeamColor: string | undefined,
  awayTeamColor: string | undefined
): string => {
  const className = generateTeamColorClassName(homeTeamColor, awayTeamColor);
  
  if (typeof document !== 'undefined' && !document.getElementById(className)) {
    const styleString = generateTeamColorCss(className, homeTeamColor, awayTeamColor);
    const styleElement = document.createElement('style');
    styleElement.id = className;
    styleElement.innerHTML = styleString;
    document.head.appendChild(styleElement);
  }
  
  return className;
};

/**
 * Utility function to generate CSS for global team colors.
 */
export const generateGlobalTeamColorsCss = (
  homeColor: string | undefined,
  awayColor: string | undefined
): string => {
  const homeTeamColor = homeColor || '#333';
  const awayTeamColor = awayColor || '#333';
  return `
    :root {
      --home-team-color: ${homeTeamColor};
      --away-team-color: ${awayTeamColor};
    }
  `;
};

/**
 * Utility function to apply team colors by setting CSS variables on :root.
 * This function dynamically creates or updates a style tag for global team colors.
 */
export const applyTeamColors = (homeColor: string | undefined, awayColor: string | undefined): void => {
  const styleId = 'team-colors-global';
  
  if (typeof document !== 'undefined') {
    const cssString = generateGlobalTeamColorsCss(homeColor, awayColor);
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    // Ensure innerHTML is updated whether the element is new or existing
    styleElement.innerHTML = cssString;
  }
};
