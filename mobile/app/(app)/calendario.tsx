import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Simple placeholder for cycle data
  // In a real app, this would come from the backend/store
  const cycleData = [
    { date: new Date(2025, 0, 10), type: 'period' },
    { date: new Date(2025, 0, 11), type: 'period' },
    { date: new Date(2025, 0, 12), type: 'period' },
    { date: new Date(2025, 0, 24), type: 'fertile' },
    { date: new Date(2025, 0, 25), type: 'fertile' },
  ];

  const getDayStatus = (date: Date) => {
    const found = cycleData.find(d => isSameDay(d.date, date));
    if (found?.type === 'period') return 'bg-pink-500 rounded-full';
    if (found?.type === 'fertile') return 'bg-teal-500 rounded-full';
    return '';
  };

  const getDayTextColor = (date: Date, isStatus: boolean) => {
    if (isStatus) return 'text-white font-bold';
    if (!isSameMonth(date, currentDate)) return 'text-gray-300';
    if (isToday(date)) return 'text-teal-600 font-bold';
    return 'text-gray-800 dark:text-gray-200';
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-6 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Calendário</Text>
        
        <View className="flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">
          <TouchableOpacity onPress={prevMonth} className="p-2">
            <ChevronLeft color={Colors.text} size={24} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </Text>
          <TouchableOpacity onPress={nextMonth} className="p-2">
            <ChevronRight color={Colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="flex-row flex-wrap justify-between">
          {/* Weekday Headers */}
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <View key={`header-${index}`} className="w-[14%] items-center mb-4">
              <Text className="text-gray-400 font-medium">{day}</Text>
            </View>
          ))}

          {/* Days */}
          {/* Note: This is a simplified view. 
              Real calendar logic needs to pad start of month with empty/prev month days 
              to align correctly with weekdays. 
              For MVP, we just list days (this might be misaligned visually if not padded).
          */}
          {Array.from({ length: 4 }).map((_, i) => <View key={`pad-${i}`} className="w-[14%]" />) /* Quick padding fix hack for example */}
          
          {daysInMonth.map((date, index) => {
            const statusClass = getDayStatus(date);
            const hasStatus = !!statusClass;
            
            return (
              <TouchableOpacity 
                key={index} 
                className={`w-[14%] aspect-square items-center justify-center mb-2`}
              >
                <View className={`w-10 h-10 items-center justify-center ${statusClass}`}>
                  <Text className={`${getDayTextColor(date, hasStatus)}`}>
                    {format(date, 'd')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-8 px-4">
          <Text className="text-gray-900 dark:text-white font-bold mb-4">Legenda</Text>
          <View className="flex-row items-center mb-3">
            <View className="w-4 h-4 bg-pink-500 rounded-full mr-3" />
            <Text className="text-gray-600 dark:text-gray-300">Menstruação</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <View className="w-4 h-4 bg-teal-500 rounded-full mr-3" />
            <Text className="text-gray-600 dark:text-gray-300">Período Fértil</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 border border-teal-600 rounded-full mr-3 items-center justify-center">
               <View className="w-1 h-1 bg-teal-600 rounded-full" />
            </View>
            <Text className="text-gray-600 dark:text-gray-300">Hoje</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
