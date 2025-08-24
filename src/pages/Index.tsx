import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, UserPlus, FileBarChart, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    thisMonthBirthdays: 0,
    maleMembers: 0,
    femaleMembers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total members count
      const { count: totalMembers } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true });

      // Get this month's birthdays
      const currentMonth = new Date().getMonth() + 1;
      const { count: thisMonthBirthdays } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .not('birth_date', 'is', null)
        .filter('birth_date', 'gte', `${new Date().getFullYear()}-${currentMonth.toString().padStart(2, '0')}-01`)
        .filter('birth_date', 'lt', `${new Date().getFullYear()}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Get gender statistics
      const { count: maleMembers } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('gender', 'male');

      const { count: femaleMembers } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('gender', 'female');

      setStats({
        totalMembers: totalMembers || 0,
        thisMonthBirthdays: thisMonthBirthdays || 0,
        maleMembers: maleMembers || 0,
        femaleMembers: femaleMembers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'মোট সদস্য',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'এই মাসের জন্মদিন',
      value: stats.thisMonthBirthdays,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'পুরুষ সদস্য',
      value: stats.maleMembers,
      icon: UserPlus,
      color: 'text-blue-600'
    },
    {
      title: 'মহিলা সদস্য',
      value: stats.femaleMembers,
      icon: FileBarChart,
      color: 'text-pink-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">পারিবারিক প্রোফাইল ম্যানেজমেন্ট সিস্টেমে স্বাগতম</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                আপনার পরিবারের সদস্যদের তথ্য পরিচালনা করুন
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">নতুন সদস্য যোগ করুন</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">পারিবারিক গাছ দেখুন</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">রিপোর্ট তৈরি করুন</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>দ্রুত লিংক</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                প্রয়োজনীয় পেজগুলিতে দ্রুত যান
              </div>
              <div className="space-y-2">
                <a href="/add-member" className="flex items-center space-x-2 text-primary hover:underline">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-sm">নতুন সদস্য যোগ করুন</span>
                </a>
                <a href="/members" className="flex items-center space-x-2 text-primary hover:underline">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">সকল সদস্য দেখুন</span>
                </a>
                <a href="/reports" className="flex items-center space-x-2 text-primary hover:underline">
                  <FileBarChart className="h-4 w-4" />
                  <span className="text-sm">রিপোর্ট তৈরি করুন</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
