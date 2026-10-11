import { Show } from "solid-js";
import { Locate, CheckCircle, AlertCircle, X } from "lucide-solid";
import type { Province } from "@/lib/provinces";

interface LocationBannerProps {
  status: "locating" | "success" | "error" | null;
  detectedProvince?: Province | null;
  distanceKm?: number;
  errorMessage?: string | null;
  onDismiss: () => void;
}

export function LocationBanner(props: LocationBannerProps) {
  return (
    <Show when={props.status}>
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Show when={props.status === "locating"}>
          <div class="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary backdrop-blur-md animate-pulse">
            <div class="flex items-center gap-2">
              <Locate class="size-4 animate-spin" />
              <span>
                កំពុងស្វែងរកទីតាំងបច្ចុប្បន្នរបស់អ្នក... · Detecting your current GPS location in Cambodia...
              </span>
            </div>
          </div>
        </Show>

        <Show when={props.status === "success" && props.detectedProvince}>
          <div class="flex items-center justify-between gap-3 rounded-2xl apple-glass border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 shadow-sm">
            <div class="flex items-center gap-2">
              <CheckCircle class="size-4 shrink-0" />
              <span>
                បានកំណត់ទីតាំងជិតបំផុត: <strong class="font-khmer">{props.detectedProvince?.nameKh}</strong> · {props.detectedProvince?.nameEn}{" "}
                {props.distanceKm !== undefined ? `(ប្រហែល ${props.distanceKm} km)` : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={props.onDismiss}
              class="rounded-full p-1 hover:bg-emerald-500/20 cursor-pointer apple-press"
            >
              <X class="size-3.5" />
            </button>
          </div>
        </Show>

        <Show when={props.status === "error"}>
          <div class="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 backdrop-blur-md">
            <div class="flex items-center gap-2">
              <AlertCircle class="size-4 shrink-0" />
              <span>
                {props.errorMessage ||
                  "មិនអាចទាញយកទីតាំង GPS បានទេ។ សូមជ្រើសរើសខេត្តដោយផ្ទាល់ពីបញ្ជី។ · Unable to access GPS location. Please select a province manually."}
              </span>
            </div>
            <button
              type="button"
              onClick={props.onDismiss}
              class="rounded p-1 hover:bg-amber-500/20 cursor-pointer"
            >
              <X class="size-3.5" />
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
}
