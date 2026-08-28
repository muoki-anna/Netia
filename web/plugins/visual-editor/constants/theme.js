/** Visual design tokens (colors, z-index, shadows) for the editor UI. */

/** Background color for floating panels and toolbars. */
export const PANEL_BG = '#1D1E20';
/** Background color for inset input surfaces inside panels (textareas, fields). */
export const PANEL_INPUT_BG = '#262831';
/** Border color for panel borders and dividers. */
export const BORDER_COLOR = '#3B3D4A';
/** Translucent white border (#fff at 20% opacity) for subtle on-dark outlines. */
export const BORDER_COLOR_TRANSLUCENT = '#ffffff33';
/** Border color for focused inputs: a touch brighter than the default, not white. */
export const BORDER_COLOR_FOCUS = '#6B6E7E';
/** Subtle hover background for interactive panel controls. */
export const HOVER_BG = '#ffffff0d';
/** Active/pressed background for panel controls. */
export const ACTIVE_BG = '#2a2b2f';
/** Default foreground color on dark panels. */
export const COLOR_WHITE = '#ffffff';
/** Secondary foreground on dark panels (#fff at 50% opacity) for labels and placeholders. */
export const TEXT_MUTED = '#ffffff80';
/** Foreground color for light (white-filled) buttons. */
export const BUTTON_LIGHT_TEXT = '#161718';
/** Hover background for light (white-filled) buttons. */
export const BUTTON_LIGHT_BG_HOVER = '#E5E5E7';
/** Outline color for editable targets in edit mode. */
export const EDIT_BORDER_COLOR = '#673DE6';
/** Hover background for editable targets in edit mode. */
export const EDIT_BACKGROUND_COLOR = '#673DE61A';
/** Accent color for annotation panel buttons and markers. */
export const ANNOTATION_COLOR = '#673DE6';
/** Hover state for annotation buttons and markers. */
export const ANNOTATION_COLOR_HOVER = '#5025D1';
/** Placeholder text color in panel inputs. */
export const PLACEHOLDER_COLOR = '#D1D5DC';

/** Browser int32 max; toolbar, dropdowns, and annotation panel. */
export const Z_INDEX_EDITOR_PANEL = 2147483647;
/** Overlays: element-type tooltip and drag-select band. */
export const Z_INDEX_EDITOR_OVERLAY = Z_INDEX_EDITOR_PANEL - 1;
/** Annotation markers. */
export const Z_INDEX_EDITOR_MARKER = Z_INDEX_EDITOR_PANEL - 2;

/** Box shadow for dropdown panels. */
export const BOX_SHADOW_DROPDOWN = '0 4px 16px 0 rgba(0, 0, 0, 0.30)';
/** Box shadow for floating editor surfaces: inline toolbars and panels. */
export const BOX_SHADOW_TOOLBAR = '0 1px 4px 0 rgba(0, 0, 0, 0.10)';
