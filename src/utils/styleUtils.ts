/**
 * Utility function to create CSS variable styles for dynamic team colors
 * This approach avoids inline styles while still allowing dynamic colors
 */
export const createTeamColorStyles = (
  homeTeamColor: string | undefined,
  awayTeamColor: string | undefined
): string => {
  const homeColor = homeTeamColor || '#333';
  const awayColor = awayTeamColor || '#333';
  
  // Create a unique class name based on the colors
  const className = `team-colors-${homeColor.replace('#', '')}-${awayColor.replace('#', '')}`;
  
  // Check if the style has already been added to the document
  if (typeof document !== 'undefined' && !document.getElementById(className)) {
    // Create a style element
    const style = document.createElement('style');
    style.id = className;
    style.innerHTML = `
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
    
    // Append the style to the head
    document.head.appendChild(style);
  }
  
  return className;
};

/**
 * Utility function to apply team colors without using inline styles
 * This function dynamically creates CSS classes for team colors
 */
export const applyTeamColors = (homeColor: string | undefined, awayColor: string | undefined): void => {
  const homeTeamColor = homeColor || '#333';
  const awayTeamColor = awayColor || '#333';
  const styleId = 'team-colors-global';
  
  // Only add the styles once
  if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      :root {
        --home-team-color: ${homeTeamColor};
        --away-team-color: ${awayTeamColor};
      }
    `;
    document.head.appendChild(style);
  } else if (typeof document !== 'undefined') {
    // Update existing style
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.innerHTML = `
        :root {
          --home-team-color: ${homeTeamColor};
          --away-team-color: ${awayTeamColor};
        }
      `;
    }
  }
};
