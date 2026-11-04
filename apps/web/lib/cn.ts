// New packaging glue for event UI classes; not an event invention.
import {clsx,type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
export function cn(...values:ClassValue[]){const classes=clsx(values);return twMerge(classes);}
