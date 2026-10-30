import { css } from "lit";

export const titleFont = css`"Roboto", sans-serif`;
export const contentFont = css`"Open Sans", sans-serif`;

export const orange = css`#f5871f`;
export const lightOrange = css`hsl(29deg 91% 84%)`;

/**
 * An outline which only shows when the element is focused
 */
export const focusOutline = css`
	.focus-outline {
		outline: 0px solid ${lightOrange};
	}
	.focus-outline:focus {
		outline-width: 3px;
	}
`;

/**
 * Hide the default disclosure triangle of a details summary
 */
export const plainSummary = css`
	summary {
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
`;

/**
 * Pages load the "Material Icons" font, md-icon defaults to "Material Symbols Outlined"
 */
export const icons = css`
	md-icon {
		--md-icon-font: "Material Icons";
	}
`;
