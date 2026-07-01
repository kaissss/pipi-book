"use client";

import { CreditCard, Smartphone, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { PaymentMethod } from "@/types";

interface PaymentFormProps {
  amount: number;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onPay: () => void;
  isLoading: boolean;
}

const PAYMENT_METHODS: { id: PaymentMethod; labelKey: string; descriptionKey: string; icon: React.ReactNode }[] = [
  {
    id: "ECPAY",
    labelKey: "booking.payment.ecpay",
    descriptionKey: "booking.payment.ecpayDescription",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "LINE_PAY",
    labelKey: "booking.payment.linePay",
    descriptionKey: "booking.payment.linePayDescription",
    icon: <Smartphone className="h-5 w-5 text-line" />,
  },
  {
    id: "CASH",
    labelKey: "booking.payment.cash",
    descriptionKey: "booking.payment.cashDescription",
    icon: <Banknote className="h-5 w-5" />,
  },
];

export default function PaymentForm({
  amount,
  selectedMethod,
  onMethodChange,
  onPay,
  isLoading,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const isCash = selectedMethod === "CASH";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedMethod === method.id
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            )}
            onClick={() => onMethodChange(method.id)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-md",
                selectedMethod === method.id ? "bg-primary/10" : "bg-muted"
              )}>
                {method.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{t(method.labelKey)}</p>
                <p className="text-xs text-muted-foreground">{t(method.descriptionKey)}</p>
              </div>
              <div className="ml-auto">
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 transition-colors",
                  selectedMethod === method.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted rounded-lg p-4 text-sm">
        <div className="flex justify-between">
          <span>{t("booking.payment.sessionFee")}</span>
          <span className="font-semibold">{formatCurrency(amount)}</span>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={onPay} disabled={isLoading}>
        {isLoading
          ? t("booking.payment.processing")
          : isCash
          ? t("booking.payment.confirmBooking")
          : t("booking.payment.payAmount", { amount: formatCurrency(amount) })}
      </Button>
    </div>
  );
}
