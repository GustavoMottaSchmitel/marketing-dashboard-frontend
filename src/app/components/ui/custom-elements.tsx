import React from 'react';
import { cn } from '@/app/lib/utils';
import { Slot } from '@radix-ui/react-slot';

// --- Button Component ---
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'default';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700', // Azul principal
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300', // Cinza claro
      outline: 'border border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700', // Borda azul, texto azul, hover suave
      ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-700', // Hover discreto
      default: 'bg-gray-700 text-white hover:bg-gray-800', // Cinza escuro
    };

    const sizeStyles: Record<ButtonSize, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <Comp
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// --- Input Component ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900", // Cores ajustadas
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// --- Label Component ---
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => {
  return (
    <label
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700", className)} // Cor ajustada
      {...props}
    />
  );
};

// --- Select Component ---
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ className, options, ...props }) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900", // Cores ajustadas
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// --- Card Components ---
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm", className)} // Cores ajustadas
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);
CardHeader.displayName = "CardHeader";

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3
    className={cn("font-semibold leading-none tracking-tight text-gray-900", className)} // Cor ajustada
    {...props}
  />
);
CardTitle.displayName = "CardTitle";

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-gray-600", className)} // Cor ajustada
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);
CardFooter.displayName = "CardFooter";

// --- Table Components ---
export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
);
Table.displayName = "Table";

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn("[&_tr]:border-b border-gray-200", className)} {...props} /> // Borda ajustada
);
TableHeader.displayName = "TableHeader";

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn("border-t border-gray-200", className)} {...props} /> // Borda ajustada
);
TableBody.displayName = "TableBody";

export const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tfoot className={cn("border-t border-gray-200 bg-gray-100 font-medium [&>tr]:last:border-b-0 text-gray-900", className)} {...props} /> // Cores ajustadas
);
TableFooter.displayName = "TableFooter";

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr
    className={cn(
      "border-b border-gray-100 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100", // Cores ajustadas
      className
    )}
    {...props}
  />
);
TableRow.displayName = "TableRow";

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-gray-600 [&:has([role=checkbox])]:pr-0", // Cor ajustada
      className
    )}
    {...props}
  />
);
TableHead.displayName = "TableHead";

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-800", className)} // Cor ajustada
    {...props}
  />
);
TableCell.displayName = "TableCell";

export const TableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>> = ({ className, ...props }) => (
  <caption className={cn("mt-4 text-sm text-gray-500", className)} {...props} /> // Cor ajustada
);
TableCaption.displayName = "TableCaption";

// --- Badge Component ---
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', color, ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantStyles = {
    default: 'border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300', // Cinza claro
    secondary: 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200', // Cinza mais claro
    outline: 'text-gray-600 border-gray-300', // Borda e texto cinza
    destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
    success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
    warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
    info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
  };

  const customColorStyle = color ? { backgroundColor: color, borderColor: color } : {};

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={customColorStyle}
      {...props}
    />
  );
};
Badge.displayName = "Badge";
