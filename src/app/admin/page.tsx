'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, QueryDocumentSnapshot, DocumentData, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogOut, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface RsvpData {
  id: string;
  email: string;
  attendingNoon: 'yes' | 'no';
  peopleNoon?: number;
  attendingEvening: 'yes' | 'no';
  peopleEvening?: number;
  comments?: string;
  submittedAt: Timestamp;
}

const ADMIN_EMAIL = 'hugues.rabier@gmail.com';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [rsvpToDelete, setRsvpToDelete] = useState<RsvpData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const unsubscribe = onSnapshot(
      collection(firestore, 'rsvps'),
      (snapshot) => {
        const rsvpList = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt || Timestamp.now(),
        } as RsvpData));
        
        rsvpList.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());

        setRsvps(rsvpList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching RSVPs:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthorized]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleDeleteClick = (rsvp: RsvpData) => {
    setRsvpToDelete(rsvp);
    setAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rsvpToDelete) return;

    try {
      await deleteDoc(doc(firestore, 'rsvps', rsvpToDelete.id));
      toast({
          title: 'Succès',
          description: `La participation de ${rsvpToDelete.email} a été supprimée.`,
      });
    } catch (error) {
        console.error('Error deleting document: ', error);
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Erreur lors de la suppression de la participation.",
        });
    }


    setAlertOpen(false);
    setRsvpToDelete(null);
  };

  if (loading || !isAuthorized) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </main>
    );
  }
  
  const totalPeopleNoon = rsvps
    .filter(r => r.attendingNoon === 'yes' && r.peopleNoon)
    .reduce((sum, r) => sum + (Number(r.peopleNoon) || 0), 0);
    
  const totalPeopleEvening = rsvps
    .filter(r => r.attendingEvening === 'yes' && r.peopleEvening)
    .reduce((sum, r) => sum + (Number(r.peopleEvening) || 0), 0);

  return (
    <>
      <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-2xl">Réponses des Invités</CardTitle>
                <CardDescription>
                  Liste de toutes les participations reçues.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Card className="bg-muted/50">
                      <CardHeader>
                          <CardTitle className="text-lg">Total Présents (Midi)</CardTitle>
                          <CardDescription className="text-2xl font-bold text-primary">{totalPeopleNoon}</CardDescription>
                      </CardHeader>
                  </Card>
                  <Card className="bg-muted/50">
                      <CardHeader>
                          <CardTitle className="text-lg">Total Présents (Soir)</CardTitle>
                          <CardDescription className="text-2xl font-bold text-primary">{totalPeopleEvening}</CardDescription>
                      </CardHeader>
                  </Card>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Midi</TableHead>
                      <TableHead className="text-center">Pers. Midi</TableHead>
                      <TableHead className="text-center">Soir</TableHead>
                      <TableHead className="text-center">Pers. Soir</TableHead>
                      <TableHead>Commentaires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvps.length > 0 ? (
                      rsvps.map((rsvp) => (
                        <TableRow key={rsvp.id}>
                          <TableCell className="font-medium">{rsvp.email}</TableCell>
                          <TableCell>{rsvp.submittedAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric'})}</TableCell>
                          <TableCell className="text-center">{rsvp.attendingNoon === 'yes' ? '✅' : '❌'}</TableCell>
                          <TableCell className="text-center">{rsvp.attendingNoon === 'yes' ? rsvp.peopleNoon : '-'}</TableCell>
                          <TableCell className="text-center">{rsvp.attendingEvening === 'yes' ? '✅' : '❌'}</TableCell>
                          <TableCell className="text-center">{rsvp.attendingEvening === 'yes' ? rsvp.peopleEvening : '-'}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" title={rsvp.comments}>{rsvp.comments || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(rsvp)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Supprimer</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          Aucune réponse pour le moment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
            <AlertDialogDescription>
            Cette action est irréversible. La participation de{' '}
            <span className="font-medium text-foreground">{rsvpToDelete?.email}</span> sera définitivement supprimée.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Supprimer
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
