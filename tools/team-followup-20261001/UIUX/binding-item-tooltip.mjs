import { readD10Binding } from '../ITEM/binding-ports.mjs';
import { createStoredD10TooltipConsumer } from './binding-tooltip.mjs';

export const describeItemBoundD10Tooltip = createStoredD10TooltipConsumer(readD10Binding);
