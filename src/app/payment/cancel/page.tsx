"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CreditCard, MessageCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Paiement annulé
          </CardTitle>
          <CardDescription className="text-base">
            Votre paiement n&apos;a pas été finalisé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Aucun montant n&apos;a été débité de votre compte. Vous pouvez
              réessayer à tout moment.
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <h4 className="font-medium text-gray-900">Besoin d&apos;aide ?</h4>
            <p>
              Si vous rencontrez des difficultés ou avez des questions,
              n&apos;hésitez pas à nous contacter. Notre équipe est là pour vous
              aider.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link href="/#pricing" className="block">
              <Button className="w-full" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Revoir les offres
              </Button>
            </Link>

            <Link href="/contact" className="block">
              <Button variant="outline" className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Nous contacter
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

