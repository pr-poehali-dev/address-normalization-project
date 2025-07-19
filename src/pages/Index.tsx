import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'results' | 'download'>('upload');
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => setCurrentStep('results')}
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
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Upload" size={24} className="text-blue-600" />
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
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Download" size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Результат</h3>
            <p className="text-slate-600 text-sm">Скачайте обработанные данные</p>
          </div>
        </div>
      </section>

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
                  <div className="text-2xl font-bold text-red-600">{mockStats.errors}</div>
                  <div className="text-sm text-slate-600">Ошибок найдено</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockStats.success}%</div>
                  <div className="text-sm text-slate-600">Успешность</div>
                </CardContent>
              </Card>
            </div>

            {/* Errors Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={20} className="text-orange-500" />
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
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
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
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
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
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold">Нормализатор адресов</h3>
        </div>
      </footer>
    </div>
  );
};

export default Index;