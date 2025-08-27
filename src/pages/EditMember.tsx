import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name_bangla: string;
  name_english?: string;
  gender?: string;
}

const EditMember = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(true);
  const [existingMembers, setExistingMembers] = useState<FamilyMember[]>([]);
  const [formData, setFormData] = useState({
    name_bangla: '',
    name_english: '',
    birth_date: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    blood_group: '' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '',
    mobile: '',
    email: '',
    profession: '',
    current_address: '',
    permanent_address: '',
    father_id: '',
    mother_id: ''
  });

  useEffect(() => {
    if (id) {
      fetchMember();
      fetchExistingMembers();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          name_bangla: data.name_bangla || '',
          name_english: data.name_english || '',
          birth_date: data.birth_date || '',
          gender: data.gender || '',
          blood_group: data.blood_group || '',
          mobile: data.mobile || '',
          email: data.email || '',
          profession: data.profession || '',
          current_address: data.current_address || '',
          permanent_address: data.permanent_address || '',
          father_id: data.father_id || '',
          mother_id: data.mother_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      toast({
        title: "ত্রুটি",
        description: "সদস্যের তথ্য লোড করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
      navigate('/members');
    } finally {
      setMemberLoading(false);
    }
  };

  const fetchExistingMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('id, name_bangla, name_english, gender')
        .neq('id', id) // Exclude current member
        .order('name_bangla');

      if (error) throw error;
      setExistingMembers(data || []);
    } catch (error) {
      console.error('Error fetching existing members:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_bangla) {
      toast({
        title: "ত্রুটি",
        description: "নাম (বাংলা) আবশ্যক",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          ...formData,
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          blood_group: formData.blood_group || null,
          father_id: formData.father_id || null,
          mother_id: formData.mother_id || null,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "সফল",
        description: "সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে"
      });

      navigate('/members');
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "ত্রুটি",
        description: "সদস্যের তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">সদস্যের তথ্য সম্পাদনা</h1>

      <Card>
        <CardHeader>
          <CardTitle>সদস্যের তথ্য আপডেট করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name_bangla">নাম (বাংলা) *</Label>
                <Input
                  id="name_bangla"
                  value={formData.name_bangla}
                  onChange={(e) => handleInputChange('name_bangla', e.target.value)}
                  placeholder="বাংলায় নাম লিখুন"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_english">নাম (ইংরেজি)</Label>
                <Input
                  id="name_english"
                  value={formData.name_english}
                  onChange={(e) => handleInputChange('name_english', e.target.value)}
                  placeholder="ইংরেজিতে নাম লিখুন"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">জন্ম তারিখ</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">লিঙ্গ</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">পুরুষ</SelectItem>
                    <SelectItem value="female">মহিলা</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">রক্তের গ্রুপ</Label>
                <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">মোবাইল নম্বর</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="মোবাইল নম্বর"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">ইমেল</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ইমেল ঠিকানা"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">পেশা</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  placeholder="পেশা"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_id">পিতা</Label>
                <Select value={formData.father_id} onValueChange={(value) => handleInputChange('father_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="পিতা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingMembers
                      .filter(member => member.gender === 'male')
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name_bangla} {member.name_english && `(${member.name_english})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_id">মাতা</Label>
                <Select value={formData.mother_id} onValueChange={(value) => handleInputChange('mother_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="মাতা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingMembers
                      .filter(member => member.gender === 'female')
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name_bangla} {member.name_english && `(${member.name_english})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_address">বর্তমান ঠিকানা</Label>
                <Textarea
                  id="current_address"
                  value={formData.current_address}
                  onChange={(e) => handleInputChange('current_address', e.target.value)}
                  placeholder="বর্তমান ঠিকানা"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permanent_address">স্থায়ী ঠিকানা</Label>
                <Textarea
                  id="permanent_address"
                  value={formData.permanent_address}
                  onChange={(e) => handleInputChange('permanent_address', e.target.value)}
                  placeholder="স্থায়ী ঠিকানা"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'আপডেট করা হচ্ছে...' : 'তথ্য আপডেট করুন'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/members')}>
                বাতিল
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMember;