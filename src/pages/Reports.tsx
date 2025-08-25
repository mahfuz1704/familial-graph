import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, FileBarChart, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const Reports = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [birthdayMembers, setBirthdayMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      filterBirthdayMembers();
    }
  }, [selectedMonth, members]);

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
    }
  };

  const filterBirthdayMembers = () => {
    if (!selectedMonth) return;
    
    const filtered = members.filter(member => {
      if (!member.birth_date) return false;
      const birthMonth = new Date(member.birth_date).getMonth() + 1;
      return birthMonth === parseInt(selectedMonth);
    });
    
    setBirthdayMembers(filtered);
  };

  const generateAllMembersReport = () => {
    const reportData = members.map(member => ({
      'নাম (বাংলা)': member.name_bangla,
      'নাম (ইংরেজি)': member.name_english || '',
      'জন্ম তারিখ': member.birth_date ? new Date(member.birth_date).toLocaleDateString('bn-BD') : '',
      'লিঙ্গ': member.gender === 'male' ? 'পুরুষ' : member.gender === 'female' ? 'মহিলা' : 'অন্যান্য',
      'মোবাইল': member.mobile || '',
      'ইমেল': member.email || '',
      'পেশা': member.profession || ''
    }));
    
    console.log('সকল সদস্যের রিপোর্ট:', reportData);
    // Here you would implement actual export functionality
  };

  const months = [
    { value: '1', label: 'জানুয়ারি' },
    { value: '2', label: 'ফেব্রুয়ারি' },
    { value: '3', label: 'মার্চ' },
    { value: '4', label: 'এপ্রিল' },
    { value: '5', label: 'মে' },
    { value: '6', label: 'জুন' },
    { value: '7', label: 'জুলাই' },
    { value: '8', label: 'আগস্ট' },
    { value: '9', label: 'সেপ্টেম্বর' },
    { value: '10', label: 'অক্টোবর' },
    { value: '11', label: 'নভেম্বর' },
    { value: '12', label: 'ডিসেম্বর' }
  ];

  const genderStats = {
    male: members.filter(m => m.gender === 'male').length,
    female: members.filter(m => m.gender === 'female').length,
    other: members.filter(m => m.gender === 'other').length
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">রিপোর্ট</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Members Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2" />
              সদস্য সংখ্যা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>মোট সদস্য:</span>
                <span className="font-semibold">{members.length}</span>
              </div>
              <div className="flex justify-between">
                <span>পুরুষ:</span>
                <span className="font-semibold">{genderStats.male}</span>
              </div>
              <div className="flex justify-between">
                <span>মহিলা:</span>
                <span className="font-semibold">{genderStats.female}</span>
              </div>
              {genderStats.other > 0 && (
                <div className="flex justify-between">
                  <span>অন্যান্য:</span>
                  <span className="font-semibold">{genderStats.other}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Birthday Report */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2" />
              জন্মদিন রিপোর্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="মাস নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedMonth && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {months.find(m => m.value === selectedMonth)?.label} মাসে {birthdayMembers.length}টি জন্মদিন
                </div>
                {birthdayMembers.slice(0, 3).map(member => (
                  <div key={member.id} className="text-sm text-muted-foreground">
                    {member.name_bangla} - {new Date(member.birth_date).getDate()}
                  </div>
                ))}
                {birthdayMembers.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    আরো {birthdayMembers.length - 3}টি...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Reports */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileBarChart className="h-5 w-5 mr-2" />
              রিপোর্ট এক্সপোর্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={generateAllMembersReport}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              সকল সদস্যের তালিকা
            </Button>
            
            {selectedMonth && birthdayMembers.length > 0 && (
              <Button 
                onClick={() => console.log('Birthday report for', months.find(m => m.value === selectedMonth)?.label)}
                className="w-full justify-start"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                জন্মদিন রিপোর্ট
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Birthday Details */}
      {selectedMonth && birthdayMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {months.find(m => m.value === selectedMonth)?.label} মাসের জন্মদিন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {birthdayMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{member.name_bangla}</div>
                    {member.name_english && (
                      <div className="text-sm text-muted-foreground">({member.name_english})</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(member.birth_date).toLocaleDateString('bn-BD')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Members Report */}
      <Card>
        <CardHeader>
          <CardTitle>সকল সদস্যের বিস্তারিত তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">নাম (বাংলা)</th>
                  <th className="text-left p-2">নাম (ইংরেজি)</th>
                  <th className="text-left p-2">জন্ম তারিখ</th>
                  <th className="text-left p-2">লিঙ্গ</th>
                  <th className="text-left p-2">মোবাইল</th>
                  <th className="text-left p-2">পেশা</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} className="border-b">
                    <td className="p-2">{member.name_bangla}</td>
                    <td className="p-2">{member.name_english || '-'}</td>
                    <td className="p-2">
                      {member.birth_date ? new Date(member.birth_date).toLocaleDateString('bn-BD') : '-'}
                    </td>
                    <td className="p-2">
                      {member.gender === 'male' ? 'পুরুষ' : member.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}
                    </td>
                    <td className="p-2">{member.mobile || '-'}</td>
                    <td className="p-2">{member.profession || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;