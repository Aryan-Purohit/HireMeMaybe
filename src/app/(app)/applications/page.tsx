"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExternalLink, MoreHorizontal, Trash2, Edit3, Eye, Star, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { TrackedApplication, ApplicationStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const statusColors: Record<ApplicationStatus, string> = {
  Bookmarked: "bg-blue-500 hover:bg-blue-600",
  Draft: "bg-gray-500 hover:bg-gray-600",
  Applied: "bg-green-500 hover:bg-green-600",
  Viewed: "bg-purple-500 hover:bg-purple-600",
  Interviewing: "bg-yellow-500 hover:bg-yellow-600 text-black",
  Offer: "bg-teal-500 hover:bg-teal-600",
  Rejected: "bg-red-500 hover:bg-red-600",
};

const ALL_STATUSES: ApplicationStatus[] = ['Bookmarked', 'Draft', 'Applied', 'Viewed', 'Interviewing', 'Offer', 'Rejected'];

export default function ApplicationsPage() {
  const { trackedApplications, updateTrackedApplication, removeTrackedApplication, isInitialized } = useAppContext();
  const [editingApplication, setEditingApplication] = useState<TrackedApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredApplications = useMemo(() => {
    return trackedApplications
      .filter(app => filterStatus === "all" || app.status === filterStatus)
      .filter(app => 
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a,b) => {
        const dateA = a.appliedDate ? parseISO(a.appliedDate) : new Date(0);
        const dateB = b.appliedDate ? parseISO(b.appliedDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [trackedApplications, filterStatus, searchTerm]);

  const handleEdit = (app: TrackedApplication) => {
    setEditingApplication(app);
  };

  const handleSaveEdit = (updatedApp: Partial<TrackedApplication>) => {
    if (editingApplication) {
      updateTrackedApplication(editingApplication.id, updatedApp);
      toast({ title: "Application Updated", description: `${editingApplication.job.title} details saved.` });
      setEditingApplication(null);
    }
  };

  const handleDelete = (appId: string, appTitle: string) => {
    removeTrackedApplication(appId);
    toast({ title: "Application Removed", description: `${appTitle} removed from tracking.`, variant: "destructive" });
  };
  
  if (!isInitialized) {
    return <div className="flex justify-center items-center h-full"><p>Loading applications...</p></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Tracked Applications</CardTitle>
              <CardDescription>Manage all your job applications in one place.</CardDescription>
            </div>
             <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/job-search">
                  <Briefcase className="mr-2 h-4 w-4" /> Find More Jobs
                </Link>
              </Button>
          </div>
           <div className="mt-4 flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Search by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ApplicationStatus | "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ALL_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-10">
              <Star className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No applications found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterStatus !== "all" || searchTerm 
                  ? "Try adjusting your filters or search term." 
                  : "Start by searching for jobs and bookmarking them."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.job.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{app.job.company}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {app.appliedDate ? format(parseISO(app.appliedDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[app.status]} text-white`}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(app)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit / View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={app.job.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" /> View Original Post
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDelete(app.id, app.job.title)} className="text-destructive hover:!bg-destructive hover:!text-destructive-foreground focus:!bg-destructive focus:!text-destructive-foreground">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingApplication && (
        <Dialog open={!!editingApplication} onOpenChange={(open) => !open && setEditingApplication(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Application: {editingApplication.job.title}</DialogTitle>
              <DialogDescription>Update the status and notes for this application.</DialogDescription>
            </DialogHeader>
            <EditApplicationForm
              application={editingApplication}
              onSave={handleSaveEdit}
              onCancel={() => setEditingApplication(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface EditApplicationFormProps {
  application: TrackedApplication;
  onSave: (updates: Partial<TrackedApplication>) => void;
  onCancel: () => void;
}

function EditApplicationForm({ application, onSave, onCancel }: EditApplicationFormProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState<string>(application.notes || "");
  const [appliedDate, setAppliedDate] = useState<string>(
    application.appliedDate ? format(parseISO(application.appliedDate), 'yyyy-MM-dd') : ""
  );

  const handleSubmit = () => {
    const updates: Partial<TrackedApplication> = {
      status,
      notes,
      appliedDate: appliedDate ? new Date(appliedDate).toISOString() : null,
    };
    if (status === 'Applied' && !updates.appliedDate) {
        updates.appliedDate = new Date().toISOString();
    }
    onSave(updates);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as ApplicationStatus)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="appliedDate" className="text-right">Applied Date</Label>
        <Input
            id="appliedDate"
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="col-span-3"
          rows={5}
          placeholder="Add any notes, interview dates, contacts, etc."
        />
      </div>
       <div className="mt-4 col-span-4">
        <h4 className="font-semibold mb-2">Tailored Documents</h4>
        {application.tailoredResume ? (
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(application.tailoredResume!)} className="mr-2">Copy Tailored Resume</Button>
        ) : <p className="text-sm text-muted-foreground">No tailored resume for this application.</p>}
        {application.tailoredCoverLetter ? (
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(application.tailoredCoverLetter!)}>Copy Tailored Cover Letter</Button>
        ) : <p className="text-sm text-muted-foreground mt-1">No tailored cover letter for this application.</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
