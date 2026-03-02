"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, CheckCircle, Eye, Pencil, Trash2, X } from "lucide-react";

import Link from "next/link";

interface DataTableRowActions {
  menu: string;
  id: string;
  entityName: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onApprove?: (id: string) => void;
  showDelete?: boolean;
  showEdit?: boolean;
  showView?: boolean;
  showApproval?: boolean;
}

export function DataTableRowActions({
  menu,
  id,
  entityName,
  onDelete,
  onEdit,
  onApprove,
  showDelete = true,
  showEdit = true,
  showView = true,
  showApproval = false,
}: DataTableRowActions) {
  return (
    <div className="flex items-center gap-1.5">
      {showView && (
        <Link href={`/${menu}/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
            <Eye size={14} />
          </Button>
        </Link>
      )}

      {showEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit?.(id)}
          className="h-8 w-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
        >
          <Pencil size={14} />
        </Button>
      )}

      {(showApproval || showDelete) && (
        <div className="w-px h-4 bg-slate-100 mx-1" />
      )}

      {showApproval && onApprove && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95">
              <CheckCircle size={12} className="mr-1.5" /> Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
            <AlertDialogHeader>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle size={24} />
              </div>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Confirm Approval</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                Are you sure you want to approve <span className="text-slate-900 font-bold">"{entityName}"</span>? This action will update the status immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-100">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onApprove(id)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest bg-emerald-500 hover:bg-emerald-600">Proceed</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showDelete && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
            <AlertDialogHeader>
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Delete Record</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                You are about to delete <span className="text-slate-900 font-bold">"{entityName}"</span>. This action is permanent and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-100">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(id)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest bg-red-500 hover:bg-red-600">Delete Forever</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
