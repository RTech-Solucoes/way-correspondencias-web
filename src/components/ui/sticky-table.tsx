import * as React from 'react';
import { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/utils/utils';

const StickyTable = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full h-full overflow-hidden">
    <div className="overflow-auto h-full">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  </div>
));
StickyTable.displayName = 'StickyTable';

const StickyTableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('sticky top-0 bg-white z-10 [&_tr]:border-b border-b', className)}
    {...props}
  />
));
StickyTableHeader.displayName = 'StickyTableHeader';

const StickyTableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
StickyTableBody.displayName = 'StickyTableBody';

const StickyTableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
));
StickyTableRow.displayName = 'StickyTableRow';

const StickyTableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 bg-white',
      className
    )}
    {...props}
  />
));
StickyTableHead.displayName = 'StickyTableHead';

const StickyTableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
StickyTableCell.displayName = 'StickyTableCell';

export {
  StickyTable,
  StickyTableHeader,
  StickyTableBody,
  StickyTableHead,
  StickyTableRow,
  StickyTableCell,
};
