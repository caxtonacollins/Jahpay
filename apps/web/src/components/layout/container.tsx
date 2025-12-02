import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/utils/animations";

interface ContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  as?: React.ElementType;
  size?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  margin?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "auto";
  animate?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizeClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

const paddingClasses = {
  none: "p-0",
  xs: "p-2",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

const marginClasses = {
  none: "m-0",
  xs: "m-2",
  sm: "m-4",
  md: "m-6",
  lg: "m-8",
  xl: "m-10",
  auto: "mx-auto my-0",
};

export function Container({
  as: Tag = "div",
  size = "xl",
  padding = "md",
  margin = "auto",
  animate = true,
  className,
  children,
  ...props
}: ContainerProps) {
  const containerClasses = cn(
    "w-full",
    sizeClasses[size],
    paddingClasses[padding],
    marginClasses[margin],
    className
  );

  if (!animate) {
    return (
      <Tag className={containerClasses} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={containerClasses}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Responsive container that changes max-width based on viewport
export function ResponsiveContainer({
  className,
  children,
  ...props
}: Omit<ContainerProps, "size">) {
  return (
    <Container
      className={cn("w-full px-4 sm:px-6 lg:px-8", "max-w-7xl", className)}
      {...props}
    >
      {children}
    </Container>
  );
}

// Section component with consistent vertical spacing
export function Section({
  className,
  children,
  ...props
}: Omit<ContainerProps, "size" | "margin" | "padding">) {
  return (
    <section className={cn("py-12 md:py-16 lg:py-20", className)} {...props}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </section>
  );
}

// Grid layout component
export function Grid({
  className,
  children,
  cols = 1,
  gap = "md",
  ...props
}: Omit<ContainerProps, "size" | "margin" | "padding"> & {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const gapClasses = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-10",
  };

  return (
    <div
      className={cn(
        "grid",
        `grid-cols-1 sm:grid-cols-${Math.min(2, cols)} md:grid-cols-${Math.min(
          3,
          cols
        )} lg:grid-cols-${cols}`,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Flex container component
export function Flex({
  className,
  children,
  direction = "row",
  justify = "start",
  align = "center",
  gap = "md",
  wrap = "nowrap",
  ...props
}: Omit<ContainerProps, "size" | "margin" | "padding"> & {
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
}) {
  const justifyClasses = {
    start: "justify-start",
    end: "justify-end",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const alignClasses = {
    start: "items-start",
    end: "items-end",
    center: "items-center",
    baseline: "items-baseline",
    stretch: "items-stretch",
  };

  const gapClasses = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div
      className={cn(
        "flex",
        {
          "flex-row": direction === "row",
          "flex-col": direction === "col",
          "flex-row-reverse": direction === "row-reverse",
          "flex-col-reverse": direction === "col-reverse",
          "flex-nowrap": wrap === "nowrap",
          "flex-wrap": wrap === "wrap",
          "flex-wrap-reverse": wrap === "wrap-reverse",
        },
        justifyClasses[justify],
        alignClasses[align],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
