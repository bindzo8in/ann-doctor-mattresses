import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserRound } from "lucide-react";

interface BuyAsGuestAuthProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogin: () => void;
  onContinueAsGuest: () => void;
}

export function BuyAsGuestAuth({
  isOpen,
  setIsOpen,
  onLogin,
  onContinueAsGuest,
}: BuyAsGuestAuthProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How would you like to checkout?</DialogTitle>

          <DialogDescription>
            You can login to your account or continue without creating an
            account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            type="button"
            onClick={onLogin}
            className="w-full"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login to Checkout
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onContinueAsGuest}
            className="w-full"
          >
            <UserRound className="mr-2 h-4 w-4" />
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}