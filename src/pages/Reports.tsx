import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  father_id?: string;
  mother_id?: string;
}

interface FamilyRelationship {
  member: FamilyMember;
  father?: FamilyMember;
  mother?: FamilyMember;
  children: FamilyMember[];
}

const Reports = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [birthdayMembers, setBirthdayMembers] = useState<FamilyMember[]>([]);
  const [familyRelationships, setFamilyRelationships] = useState<FamilyRelationship[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      generateFamilyRelationships();
    }
  }, [members]);

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

  const generateFamilyRelationships = () => {
    const relationships: FamilyRelationship[] = [];
    const memberMap = new Map(members.map(m => [m.id, m]));

    members.forEach(member => {
      const father = member.father_id ? memberMap.get(member.father_id) : undefined;
      const mother = member.mother_id ? memberMap.get(member.mother_id) : undefined;
      const children = members.filter(m => m.father_id === member.id || m.mother_id === member.id);

      relationships.push({
        member,
        father,
        mother,
        children
      });
    });

    setFamilyRelationships(relationships);
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

      {/* Family Relationships Report */}
      <Card>
        <CardHeader>
          <CardTitle>পারিবারিক সম্পর্ক</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyRelationships.map((relationship) => (
              <div key={relationship.member.id} className="border rounded-lg p-4">
                <div className="font-semibold text-lg mb-3">
                  {relationship.member.name_bangla}
                  {relationship.member.name_english && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({relationship.member.name_english})
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>পিতা:</strong>{' '}
                    {relationship.father ? (
                      <span>
                        {relationship.father.name_bangla}
                        {relationship.father.name_english && ` (${relationship.father.name_english})`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">উল্লেখ নেই</span>
                    )}
                  </div>
                  
                  <div>
                    <strong>মাতা:</strong>{' '}
                    {relationship.mother ? (
                      <span>
                        {relationship.mother.name_bangla}
                        {relationship.mother.name_english && ` (${relationship.mother.name_english})`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">উল্লেখ নেই</span>
                    )}
                  </div>
                  
                  <div>
                    <strong>সন্তান:</strong>{' '}
                    {relationship.children.length > 0 ? (
                      <div className="space-y-1">
                        {relationship.children.map((child) => (
                          <div key={child.id}>
                            {child.name_bangla}
                            {child.name_english && ` (${child.name_english})`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">নেই</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Members with Relationships Report */}
      <Card>
        <CardHeader>
          <CardTitle>সকল সদস্যের সম্পর্ক সহ বিস্তারিত তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম (বাংলা)</TableHead>
                  <TableHead>নাম (ইংরেজি)</TableHead>
                  <TableHead>জন্ম তারিখ</TableHead>
                  <TableHead>লিঙ্গ</TableHead>
                  <TableHead>পিতা</TableHead>
                  <TableHead>মাতা</TableHead>
                  <TableHead>মোবাইল</TableHead>
                  <TableHead>পেশা</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyRelationships.map((relationship) => (
                  <TableRow key={relationship.member.id}>
                    <TableCell className="font-medium">
                      {relationship.member.name_bangla}
                    </TableCell>
                    <TableCell>
                      {relationship.member.name_english || '-'}
                    </TableCell>
                    <TableCell>
                      {relationship.member.birth_date ? 
                        new Date(relationship.member.birth_date).toLocaleDateString('bn-BD') : '-'}
                    </TableCell>
                    <TableCell>
                      {relationship.member.gender === 'male' ? 'পুরুষ' : 
                       relationship.member.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}
                    </TableCell>
                    <TableCell>
                      {relationship.father ? relationship.father.name_bangla : '-'}
                    </TableCell>
                    <TableCell>
                      {relationship.mother ? relationship.mother.name_bangla : '-'}
                    </TableCell>
                    <TableCell>
                      {relationship.member.mobile || '-'}
                    </TableCell>
                    <TableCell>
                      {relationship.member.profession || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;