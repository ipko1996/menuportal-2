import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@mono-repo/ui';
import { useDeleteDishById, type DishResponseDto } from '@mono-repo/api-client';
import { useInvalidateDishes } from '../hooks/use-invalidate-dishes';

interface DeleteDishDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dish: DishResponseDto;
}

export function DeleteDishDialog({
  isOpen,
  onOpenChange,
  dish,
}: DeleteDishDialogProps) {
  const { mutate: deleteDish, isPending: isDeleting } = useDeleteDishById({
    mutation: useInvalidateDishes(
      `Dish "${dish?.dishName}" deleted successfully`
    ),
  });

  const handleConfirm = () => {
    if (dish) {
      deleteDish({ id: dish.id });
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Dish</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{dish?.dishName}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
