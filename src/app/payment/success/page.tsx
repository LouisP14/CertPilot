"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Paiement réussi !
          </CardTitle>
          <CardDescription className="text-base">
            Votre abonnement CertPilot a été activé avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Vérifiez vos emails
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Vous allez recevoir un email avec vos identifiants de
                  connexion dans les prochaines minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <h4 className="font-medium text-gray-900">Prochaines étapes :</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>Consultez votre boîte mail (et les spams)</li>
              <li>Connectez-vous avec le mot de passe temporaire</li>
              <li>Changez votre mot de passe à la première connexion</li>
              <li>Commencez à gérer vos formations !</li>
            </ol>
          </div>

          <div className="pt-4 space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                Se connecter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>

          {sessionId && (
            <p className="text-xs text-center text-gray-400 mt-4">
              Référence : {sessionId.slice(0, 20)}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Chargement...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
