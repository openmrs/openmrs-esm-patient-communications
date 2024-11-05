import React from 'react';
import { SWRConfig } from 'swr';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

// This component wraps whatever component is passed to it with an SWRConfig context which provides a global configuration for all SWR hooks.
const swrWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        // Sets the `dedupingInterval` to 0 - we don't need to dedupe requests in our test environment.
        dedupingInterval: 0,
        // Returns a new Map object, effectively wrapping our application with an empty cache provider. This is useful for resetting the SWR cache between test cases.
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
};

// Render the provided component within the wrapper we created above
export const renderWithSwr = (ui, options?) => render(ui, { wrapper: swrWrapper, ...options });

// Helper function that waits for a loading state to disappear from the screen
export function waitForLoadingToFinish() {
  if (screen.queryAllByRole('progressbar').length) {
    return waitForElementToBeRemoved(() => [...screen.queryAllByRole('progressbar')], {
      timeout: 4000,
    });
  }
}

// Custom matcher that queries elements split up by multiple HTML elements by text
export function getByTextWithMarkup(text: RegExp | string) {
  try {
    return screen.getByText((content, node) => {
      const hasText = (node: Element) => node.textContent === text || node.textContent.match(text);
      const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child as HTMLElement));
      return hasText(node) && childrenDontHaveText;
    });
  } catch (error) {
    throw new Error(`Text '${text}' not found. ${error}`);
  }
}
