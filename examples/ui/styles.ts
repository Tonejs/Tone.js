import { css } from "lit";

export const font = css`"Hanken Grotesk", sans-serif`;
export const monoFont = css`"Geist Mono", monospace`;

export const orange = css`#f5871f`;
export const purple = css`#7f33ed`;
export const blue = css`#1565c0`;
/** The slider pad's green, dark enough to read as text */
export const green = css`hsl(129deg 76% 35%)`;
export const lightOrange = css`hsl(29deg 91% 84%)`;
export const lightGray = css`#ececec`;

/**
 * Styles for the page itself, the example's own markup is not in any shadow root
 */
export const pageStyles = css`
	tone-example a {
		color: ${purple};
	}
`;

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
 * A details summary with the text first and a chevron at the end,
 * which points right when closed and down when open
 */
export const disclosure = css`
	summary {
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.chevron {
		flex: none;
		width: 5px;
		height: 5px;
		margin: 0px 6px;
		border-right: 1.5px solid #999;
		border-bottom: 1.5px solid #999;
		transform: rotate(-45deg);
	}
	details[open] > summary .chevron {
		transform: rotate(45deg);
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
