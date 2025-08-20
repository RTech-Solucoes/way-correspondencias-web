import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BaseModalI {
  containerStyle?: string;
  closeFunction?: () => void;
  title: string;
  children?: React.ReactNode;
  bodyStyle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function BaseModal({
  containerStyle,
  children,
  bodyStyle,
  title,
  open = false,
  onOpenChange,
}: BaseModalI) {
  return (
    <div className={`${containerStyle}`}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`rounded-base overflow-hidden rounded-md flex flex-col z-[1001] w-full h-full`}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div
            className={`flex-1 overflow-x-auto overflow-y-auto px-8 py-4 ${bodyStyle}`}
          >
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

