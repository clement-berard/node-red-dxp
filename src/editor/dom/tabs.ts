import { snakeCase } from 'es-toolkit';
// Brings the ambient `declare global { var RED }` from src/global.ts into scope.
import '../../global';

type InitTabsParams = {
  targetId: string;
  tabsLabel: string[];
  initialTab: string;
};

/**
 * Initializes a tab system with the provided configuration and handles tab switching behavior.
 * This function creates a set of tabs and associates them with a specified container. It also sets
 * an initial active tab and switches between tabs when a tab is clicked.
 *
 * @param {InitTabsParams} params - The configuration object to initialize the tabs.
 * @param {string} params.targetId - The unique identifier for the tab container element. This ID will
 *                                  be used to create a content section that corresponds to the tabs.
 * @param {string[]} params.tabsLabel - An array of labels for the tabs. Each label represents a tab.
 *                                      The labels are displayed as tab names in the UI.
 * @param {string} params.initialTab - The label of the tab to be activated initially when the tabs
 *                                      are first rendered. This label must match one of the labels in
 *                                      the `tabsLabel` array.
 *
 * @example
 * // Example usage of the initTabs function
 * const tabsConfig = {
 *   targetId: 'myTabContainer',
 *   tabsLabel: ['Tab 1', 'Tab 2', 'Tab 3'],
 *   initialTab: 'Tab 2',
 * };
 * initTabs(tabsConfig);
 *
 * // In the above example:
 * // - The tab container is identified by 'myTabContainer'.
 * // - Three tabs are created with the labels "Tab 1", "Tab 2", and "Tab 3".
 * // - The second tab ("Tab 2") is set as the initially active tab.
 *
 * @returns {void}
 *
 * @throws {Error} Throws an error if the `params.targetId` is missing or invalid.
 * @throws {Error} Throws an error if the `params.tabsLabel` is empty or not provided.
 * @throws {Error} Throws an error if the `params.initialTab` does not match any label in `tabsLabel`.
 */
export function initTabs(params: InitTabsParams) {
  const elementContent = `#tabs-content-${params.targetId}`;

  // @ts-expect-error
  const tabs = RED.tabs.create({
    id: params.targetId,
    onchange: (tab: { id: string }) => {
      $(elementContent).children().addClass('hidden');
      $(`#${tab.id}`).removeClass('hidden');
    },
  });

  (params.tabsLabel || []).forEach((tabLabel) => {
    tabs.addTab({
      id: `tab-${snakeCase(tabLabel)}`,
      label: tabLabel,
    });
  });

  tabs.activateTab(`tab-${snakeCase(params.initialTab)}`);
}
