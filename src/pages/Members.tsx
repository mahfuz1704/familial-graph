import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name_bangla: string;
  name_english: string;
  birth_date: string;
  gender: string;
  mobile: string;
  email: string;
  profession: string;
}

const Members = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('name_bangla');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memberId: string, memberName: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "সফল",
        description: `${memberName} সফলভাবে মুছে ফেলা হয়েছে`
      });

      // Refresh the members list
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "ত্রুটি",
        description: "সদস্য মুছে ফেলতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const filteredMembers = members.filter(member =>
    member.name_bangla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.name_english?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">সদস্যগণ</h1>
        <Link to="/add-member">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            নতুন সদস্য যোগ করুন
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>সদস্য তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="নাম দিয়ে অনুসন্ধান করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'কোনো সদস্য খুঁজে পাওয়া যায়নি' : 'এখনো কোনো সদস্য যোগ করা হয়নি'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {member.name_bangla}
                          {member.name_english && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({member.name_english})
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {member.birth_date && (
                            <div>জন্ম তারিখ: {new Date(member.birth_date).toLocaleDateString('bn-BD')}</div>
                          )}
                          {member.gender && (
                            <div>লিঙ্গ: {member.gender === 'male' ? 'পুরুষ' : member.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}</div>
                          )}
                          {member.mobile && <div>মোবাইল: {member.mobile}</div>}
                          {member.email && <div>ইমেল: {member.email}</div>}
                          {member.profession && <div>পেশা: {member.profession}</div>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/edit-member/${member.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>নিশ্চিত করুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে "{member.name_bangla}" সদস্যকে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরত নেওয়া যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(member.id, member.name_bangla)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                মুছে ফেলুন
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Members;