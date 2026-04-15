"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilteredTransactions } from "contexts/transactions-context";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/lib/transactions/types";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/loading";
import { fadeIn } from "@/lib/utils/animations";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusIcons = {
  [TransactionStatus.PENDING]: <Clock className="h-4 w-4 text-yellow-500" />,
  [TransactionStatus.PROCESSING]: (
    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
  ),
  [TransactionStatus.COMPLETED]: (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ),
  [TransactionStatus.FAILED]: <XCircle className="h-4 w-4 text-red-500" />,
  [TransactionStatus.CANCELLED]: <XCircle className="h-4 w-4 text-gray-500" />,
  [TransactionStatus.REFUNDED]: (
    <RefreshCw className="h-4 w-4 text-purple-500" />
  ),
};

const typeIcons = {
  [TransactionType.SWAP]: <RefreshCw className="h-4 w-4" />,
  [TransactionType.SEND]: <ArrowUpRight className="h-4 w-4" />,
  [TransactionType.RECEIVE]: <ArrowDownLeft className="h-4 w-4" />,
  [TransactionType.DEPOSIT]: <ArrowDownLeft className="h-4 w-4" />,
  [TransactionType.WITHDRAWAL]: <ArrowUpRight className="h-4 w-4" />,
};

const statusVariants = {
  [TransactionStatus.PENDING]:
    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  [TransactionStatus.PROCESSING]:
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
  [TransactionStatus.COMPLETED]:
    "bg-green-500/10 text-green-500 border-green-500/20",
  [TransactionStatus.FAILED]: "bg-red-500/10 text-red-500 border-red-500/20",
  [TransactionStatus.CANCELLED]:
    "bg-gray-500/10 text-gray-500 border-gray-500/20",
  [TransactionStatus.REFUNDED]:
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const typeVariants = {
  [TransactionType.SWAP]: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  [TransactionType.SEND]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  [TransactionType.RECEIVE]:
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  [TransactionType.DEPOSIT]:
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  [TransactionType.WITHDRAWAL]:
    "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

interface TransactionListProps {
  limit?: number;
  showFilters?: boolean;
  showTitle?: boolean;
  className?: string;
}

export function TransactionList({
  limit = 5,
  showFilters = true,
  showTitle = true,
  className,
}: TransactionListProps) {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  const {
    transactions = [],
    isLoading,
    error,
  } = useFilteredTransactions({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleRetry = async (id: string, tx: Transaction) => {
    // TODO: Implement retry logic
    console.log("Retrying transaction:", id, tx);
    // This is a placeholder - implement your retry logic here
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {showTitle && (
          <h3 className="text-lg font-medium">Recent Transactions</h3>
        )}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive/20", className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h4 className="text-lg font-medium text-destructive">
                We couldn’t load your transactions
              </h4>
              <p className="text-sm text-muted-foreground">
                Please refresh and try again.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className={cn("text-center", className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Your transactions will appear here once you make one.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {showTitle && (
          <h3 className="text-lg font-medium">Recent Transactions</h3>
        )}

        {showFilters && (
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TransactionStatus | "all")
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              {Object.values(TransactionStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as TransactionType | "all")
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              {Object.values(TransactionType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="space-y-3"
        >
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        typeVariants[tx.type as keyof typeof typeVariants]
                      )}
                    >
                      {typeIcons[tx.type as keyof typeof typeIcons]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center space-x-1.5 border",
                      statusVariants[tx.status as keyof typeof statusVariants]
                    )}
                  >
                    {statusIcons[tx.status as keyof typeof statusIcons]}
                    <span>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </Badge>
                </CardHeader>

                <CardContent className="py-2 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {tx.fromAmount} {tx.metadata.fromAddress || "UNKNOWN"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rate: {tx.rate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {tx.toAmount} {tx.metadata.toAddress || "UNKNOWN"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: {tx.fee} {tx.metadata.feeCurrency || ""}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {tx.status === TransactionStatus.FAILED && (
                  <CardFooter className="border-t bg-muted/20 p-3">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          {tx.metadata.error?.message || "Transaction failed"}
                        </p>
                      </div>
                      {tx.retryCount < tx.maxRetries && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(tx.id, tx)}
                          className="h-8 text-xs"
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
