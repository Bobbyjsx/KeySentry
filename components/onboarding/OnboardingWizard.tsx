"use client";

import { Input } from "@/components/ui/input";
import { useStartScan } from "@/hooks/data/useScan/useScan";
import { useSaveSettings } from "@/hooks/data/useSettings/useSettings";
import { isServerError, notifyServerError } from "@/lib/server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Github,
  Key,
  Loader2,
  Shield,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const tokenSchema = z.object({
  token: z
    .string()
    .refine((val) => val.startsWith("ghp_") || val.startsWith("github_pat_"), {
      message:
        "Please enter a valid GitHub token starting with ghp_ or github_pat_",
    }),
});

type TokenFormValues = z.infer<typeof tokenSchema>;

const scanSchema = z.object({
  scanTarget: z
    .string()
    .min(1, "Please provide a repository or account to scan"),
});

type ScanFormValues = z.infer<typeof scanSchema>;

export default function OnboardingWizard({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [gitUsername, setGitUsername] = useState("");
  const [isStartingScan, setIsStartingScan] = useState(false);

  const saveSettingsMutation = useSaveSettings();
  const startScanMutation = useStartScan();
  const router = useRouter();

  const tokenForm = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: "" },
  });

  const scanForm = useForm<ScanFormValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: { scanTarget: "" },
  });

  const onTokenSubmit = async (data: TokenFormValues) => {
    setIsValidating(true);
    try {
      // Save token to DB via settings API
      const saveRes = await saveSettingsMutation.mutateAsync({
        githubToken: data.token,
        scanFrequency: "daily",
      });

      if (isServerError(saveRes)) {
        notifyServerError(saveRes);
        return;
      }

      toast.success("Token verified and saved successfully.");
      setStep(3);
    } catch (err: any) {
      if (isServerError(err)) {
        notifyServerError(err);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const onScanSubmit = async (data: ScanFormValues) => {
    setIsStartingScan(true);
    try {
      const cleanTarget = data.scanTarget.replace(/\s+/g, "");
      const scanRes = await startScanMutation.mutateAsync({
        sources: [{ type: "github", value: cleanTarget }],
        repository: cleanTarget,
        scanDepth: "shallow",
      });

      if (isServerError(scanRes)) {
        notifyServerError(scanRes);
        return;
      }

      toast.success("Initial scan triggered successfully!");
      onComplete();
      router.push(`/scan/${scanRes.scanId}`);
    } catch (err: any) {
      if (isServerError(err)) {
        notifyServerError(err);
      }
    } finally {
      setIsStartingScan(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas p-4 sm:p-6 md:p-10 font-sans">
      <div className="w-full max-w-xl rounded-sm border border-hairline bg-canvas-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent-dusk/10 blur-3xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-white" />
            <span className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono-sm">
              KeySentry Onboarding
            </span>
          </div>
          <div className="flex space-x-1">
            <div
              className={`h-1 w-8 rounded-pill transition-colors ${step >= 1 ? "bg-white" : "bg-hairline"}`}
            />
            <div
              className={`h-1 w-8 rounded-pill transition-colors ${step >= 2 ? "bg-white" : "bg-hairline"}`}
            />
            <div
              className={`h-1 w-8 rounded-pill transition-colors ${step >= 3 ? "bg-white" : "bg-hairline"}`}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-caption-mono-sm uppercase text-accent-sunset tracking-caption-mono">
                01 / Introduction
              </span>
              <h1 className="text-3xl font-light text-white tracking-display-sm">
                Secure Your Secrets
              </h1>
              <p className="text-body-md text-gray-400">
                KeySentry scans your repositories and environments in real-time
                to locate and alert you about exposed credentials and API keys
                before malicious actors do.
              </p>
            </div>
            <div className="rounded-sm border border-hairline bg-canvas-soft p-4 flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-accent-twilight mt-0.5 flex-shrink-0" />
              <div className="text-body-sm text-gray-300">
                You are minutes away from securing your codebase. Let's set up a
                read-only GitHub access token to configure your first code
                scanner.
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors"
              >
                <span>Begin Setup</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: GitHub PAT Setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-caption-mono-sm uppercase text-accent-sunset tracking-caption-mono">
                02 / Authentication
              </span>
              <h1 className="text-3xl font-light text-white tracking-display-sm">
                Connect GitHub
              </h1>
              <p className="text-body-md text-gray-400">
                We require a Personal Access Token to search your code. The
                token remains locally encrypted and is never shared.
              </p>
            </div>

            <form
              onSubmit={tokenForm.handleSubmit(onTokenSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="block font-mono text-caption-mono-sm uppercase text-gray-400 tracking-caption-mono-sm">
                  Personal Access Token (Classic or Fine-grained)
                </label>
                <Input
                  type={showToken ? "text" : "password"}
                  required
                  placeholder="ghp_... or github_pat_..."
                  error={tokenForm.formState.errors.token?.message}
                  {...tokenForm.register("token")}
                  leftNode={<Key className="h-4 w-4 text-gray-400" />}
                  rightNode={
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <div className="flex items-center space-x-2 pt-1">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=KeySentry%20Scanner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white underline transition-colors"
                  >
                    Generate a token with `repo` and `read:user` scopes on
                    GitHub
                  </a>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-mono text-xs uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isValidating}
                  className="flex items-center space-x-2 rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Trigger Scan */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-caption-mono-sm uppercase text-accent-sunset tracking-caption-mono">
                03 / scan configuration
              </span>
              <h1 className="text-3xl font-light text-white tracking-display-sm">
                Run First Scan
              </h1>
              <p className="text-body-md text-gray-400">
                Setup your scan target. We will perform an initial scan
                immediately to identify any exposed credentials.
              </p>
            </div>

            <form
              onSubmit={scanForm.handleSubmit(onScanSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="block font-mono text-caption-mono-sm uppercase text-gray-400 tracking-caption-mono-sm">
                  Scan Target
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    placeholder="username, organization or username/repository"
                    error={scanForm.formState.errors.scanTarget?.message}
                    {...scanForm.register("scanTarget")}
                    leftNode={<Github className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your GitHub username to scan all public repos, or a
                  specific `owner/repo` to target a single workspace.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="font-mono text-xs uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Change Token
                </button>
                <button
                  type="submit"
                  disabled={isStartingScan}
                  className="flex items-center space-x-2 rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
                >
                  {isStartingScan ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Triggering Scan...</span>
                    </>
                  ) : (
                    <>
                      <span>Trigger Initial Scan</span>
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
