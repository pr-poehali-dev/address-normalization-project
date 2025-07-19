import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'results' | 'download'>('upload');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Анимация прогресса
  useEffect(() => {
    if (currentStep === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep('results'), 1000);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [currentStep]);
  
  // Mock data для результатов
  const mockErrors = [
    { id: 1, address: 'г. Москва, ул. Тверская д. 10', error: 'Отсутствует строение', severity: 'medium' },
    { id: 2, address: 'СПб, Невский пр-т', error: 'Неполный адрес', severity: 'high' },
    { id: 3, address: 'Екатеринбург, Ленина 52a', error: 'Некорректный формат дома', severity: 'low' },
  ];

  const mockStats = {
    total: 1247,
    normalized: 1089,
    errors: 158,
    success: 87.3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-green-600 rounded-2xl flex items-center justify-center">
              <Icon name="MapPin" size={32} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Нормализатор адресов
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            Автоматическая нормализация и проверка адресов в ваших базах данных. 
            Обнаружение ошибок, стандартизация форматов и повышение качества данных.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => {
                setIsProcessing(true);
                setCurrentStep('processing');
                setProgress(0);
              }}
            >
              <Icon name="Upload" size={20} className="mr-2" />
              Загрузить файл
            </Button>
            
            <div className="text-sm text-slate-500">
              Поддерживаются форматы: CSV, Excel, JSON
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Upload" size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Загрузка</h3>
            <p className="text-slate-600 text-sm">Загрузите файл с адресами для обработки</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Zap" size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Обработка</h3>
            <p className="text-slate-600 text-sm">ИИ анализирует и нормализует адреса</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Download" size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Результат</h3>
            <p className="text-slate-600 text-sm">Скачайте обработанные данные</p>
          </div>
        </div>
      </section>

      {/* Processing Section */}
      {currentStep === 'processing' && (
        <section className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Icon name="Zap" size={40} className="text-purple-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Обрабатываем адреса...</h2>
            <p className="text-slate-600 mb-8 text-lg">
              ИИ анализирует ваши данные и исправляет найденные ошибки
            </p>

            <div className="space-y-6">
              <div className="text-left">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Прогресс обработки</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-purple-600 font-semibold">Чтение файла</div>
                  <div className="text-slate-500">1,247 адресов найдено</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-green-600 font-semibold">Нормализация</div>
                  <div className="text-slate-500">Приведение к стандарту</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-slate-400 font-semibold">Анализ ошибок</div>
                  <div className="text-slate-500">Ожидание...</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {currentStep === 'results' && (
        <section className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Результаты обработки</h2>
              <p className="text-slate-600">Анализ завершен. Найдены ошибки в {mockErrors.length} адресах</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-900">{mockStats.total}</div>
                  <div className="text-sm text-slate-600">Всего адресов</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{mockStats.normalized}</div>
                  <div className="text-sm text-slate-600">Нормализовано</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{mockStats.errors}</div>
                  <div className="text-sm text-slate-600">Ошибок найдено</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{mockStats.success}%</div>
                  <div className="text-sm text-slate-600">Успешность</div>
                </CardContent>
              </Card>
            </div>

            {/* Errors Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={20} className="text-purple-500" />
                  Найденные ошибки
                </CardTitle>
                <CardDescription>
                  Список адресов, требующих внимания
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Ошибка</TableHead>
                      <TableHead>Критичность</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockErrors.map((error) => (
                      <TableRow key={error.id}>
                        <TableCell className="font-medium">{error.address}</TableCell>
                        <TableCell>{error.error}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={error.severity === 'high' ? 'destructive' : 
                                   error.severity === 'medium' ? 'default' : 'secondary'}
                          >
                            {error.severity === 'high' ? 'Высокая' : 
                             error.severity === 'medium' ? 'Средняя' : 'Низкая'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
                onClick={() => setCurrentStep('download')}
              >
                Перейти к скачиванию
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Download Section */}
      {currentStep === 'download' && (
        <section className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Icon name="CheckCircle" size={40} className="text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Обработка завершена!</h2>
            <p className="text-slate-600 mb-12 text-lg">
              Ваши адреса успешно нормализованы. Скачайте результаты в удобном формате.
            </p>

            <div className="grid gap-4 max-w-md mx-auto">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Icon name="Download" size={20} className="mr-2" />
                Скачать Excel
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="py-4 text-lg font-medium rounded-xl border-2 transition-all duration-200 hover:scale-105"
              >
                <Icon name="Download" size={20} className="mr-2" />
                Скачать CSV
              </Button>
            </div>

            <div className="mt-8">
              <Button 
                variant="ghost"
                onClick={() => setCurrentStep('upload')}
                className="text-slate-600 hover:text-slate-900"
              >
                Обработать новый файл
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-green-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold">Нормализатор адресов</h3>
        </div>
      </footer>
    </div>
  );
};

export default Index;