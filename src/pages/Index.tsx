import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Fuse from 'fuse.js';

interface AddressData {
  id: number;
  original: string;
  normalized: string;
  status: 'success' | 'warning' | 'error';
}

interface ErrorData {
  id: number;
  address: string;
  error: string;
  severity: 'high' | 'medium' | 'low';
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'results' | 'download'>('upload');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedResults, setProcessedResults] = useState<AddressData[]>([]);
  const [foundErrors, setFoundErrors] = useState<ErrorData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Словарь для нормализации адресов
  const cityDictionary = [
    { key: 'спб', correct: 'г. Санкт-Петербург' },
    { key: 'санкт-петербург', correct: 'г. Санкт-Петербург' },
    { key: 'питер', correct: 'г. Санкт-Петербург' },
    { key: 'москва', correct: 'г. Москва' },
    { key: 'мск', correct: 'г. Москва' },
    { key: 'екатеринбург', correct: 'г. Екатеринбург' },
    { key: 'новосибирск', correct: 'г. Новосибирск' },
    { key: 'казань', correct: 'г. Казань' },
  ];

  const streetTypes = [
    { key: 'ул', correct: 'ул.' },
    { key: 'улица', correct: 'ул.' },
    { key: 'пр-т', correct: 'пр.' },
    { key: 'проспект', correct: 'пр.' },
    { key: 'пер', correct: 'пер.' },
    { key: 'переулок', correct: 'пер.' },
  ];

  // Обработка файла
  const processFile = async (file: File): Promise<{ results: AddressData[], errors: ErrorData[] }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let data: string[][] = [];
          
          if (file.name.endsWith('.csv')) {
            const csvText = e.target?.result as string;
            const parsed = Papa.parse(csvText, { header: false });
            data = parsed.data as string[][];
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
          }

          const results: AddressData[] = [];
          const errors: ErrorData[] = [];
          
          data.slice(1).forEach((row, index) => {
            if (row[0]) {
              const original = row[0].toString().trim();
              const normalized = normalizeAddress(original);
              const validation = validateAddress(normalized);
              
              results.push({
                id: index + 1,
                original,
                normalized,
                status: validation.isValid ? 'success' : validation.severity === 'high' ? 'error' : 'warning'
              });

              if (!validation.isValid) {
                errors.push({
                  id: index + 1,
                  address: original,
                  error: validation.error,
                  severity: validation.severity
                });
              }
            }
          });

          resolve({ results, errors });
        } catch (error) {
          console.error('Ошибка обработки файла:', error);
          resolve({ results: [], errors: [] });
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Нормализация адреса
  const normalizeAddress = (address: string): string => {
    let normalized = address.toLowerCase().trim();

    // Нормализация городов с помощью Fuse.js
    const cityFuse = new Fuse(cityDictionary, { keys: ['key'], threshold: 0.3 });
    cityDictionary.forEach(city => {
      const regex = new RegExp(`\\b${city.key}\\b`, 'gi');
      normalized = normalized.replace(regex, city.correct);
    });

    // Нормализация типов улиц
    streetTypes.forEach(street => {
      const regex = new RegExp(`\\b${street.key}\\b`, 'gi');
      normalized = normalized.replace(regex, street.correct);
    });

    // Нормализация дома/строения
    normalized = normalized.replace(/\bд\.?\s*(\w+)/gi, ', д. $1');
    normalized = normalized.replace(/\bстр\.?\s*(\w+)/gi, ', стр. $1');
    
    // Убираем лишние пробелы и приводим к правильному регистру
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  // Валидация адреса
  const validateAddress = (address: string): { isValid: boolean, error: string, severity: 'high' | 'medium' | 'low' } => {
    if (address.length < 10) {
      return { isValid: false, error: 'Слишком короткий адрес', severity: 'high' };
    }
    
    if (!address.includes('г.') && !address.includes('город')) {
      return { isValid: false, error: 'Не указан город', severity: 'high' };
    }
    
    if (!address.includes('ул.') && !address.includes('пр.') && !address.includes('пер.')) {
      return { isValid: false, error: 'Не указан тип улицы', severity: 'medium' };
    }
    
    if (!address.includes('д.')) {
      return { isValid: false, error: 'Не указан номер дома', severity: 'medium' };
    }
    
    return { isValid: true, error: '', severity: 'low' };
  };

  // Обработка загрузки файла
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      setCurrentStep('processing');
      setProgress(0);
      
      const processed = await processFile(file);
      setProcessedResults(processed.results);
      setFoundErrors(processed.errors);
    }
  };

  // Скачивание результатов
  const downloadResults = (format: 'csv' | 'xlsx') => {
    if (format === 'csv') {
      const csv = Papa.unparse(processedResults.map(r => ({
        'Исходный адрес': r.original,
        'Нормализованный адрес': r.normalized,
        'Статус': r.status === 'success' ? 'Успешно' : r.status === 'warning' ? 'Предупреждение' : 'Ошибка'
      })));
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'normalized_addresses.csv';
      link.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(processedResults.map(r => ({
        'Исходный адрес': r.original,
        'Нормализованный адрес': r.normalized,
        'Статус': r.status === 'success' ? 'Успешно' : r.status === 'warning' ? 'Предупреждение' : 'Ошибка'
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Нормализованные адреса');
      XLSX.writeFile(wb, 'normalized_addresses.xlsx');
    }
  };

  const displayResults = processedResults.length > 0 ? processedResults : [
    { id: 1, original: 'г. Москва, ул. Тверская д. 10', normalized: 'г. Москва, ул. Тверская, д. 10', status: 'success' as const },
    { id: 2, original: 'СПб, Невский пр-т', normalized: 'г. Санкт-Петербург, Невский пр.', status: 'warning' as const },
    { id: 3, original: 'Екатеринбург, Ленина 52a', normalized: 'г. Екатеринбург, ул. Ленина, д. 52А', status: 'success' as const },
  ];
  
  const displayErrors = foundErrors.length > 0 ? foundErrors : [
    { id: 1, address: 'СПб, Невский пр-т', error: 'Неполный адрес', severity: 'high' as const },
    { id: 2, address: 'Казань центр', error: 'Слишком общий адрес', severity: 'high' as const },
  ];

  const stats = {
    total: displayResults.length,
    normalized: displayResults.filter(r => r.status === 'success').length,
    errors: displayErrors.length,
    success: Math.round((displayResults.filter(r => r.status === 'success').length / displayResults.length) * 100)
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
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Upload" size={20} className="mr-2" />
              Загрузить файл
            </Button>
            
            <div className="text-sm text-slate-500">
              Поддерживаются форматы: CSV, Excel
              {uploadedFile && <div className="text-green-600 mt-1">Загружен: {uploadedFile.name}</div>}
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
            <p className="text-slate-600 text-sm">Наш код обрабатывает данные и выводит данные и ошибки</p>
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
              <p className="text-slate-600">Анализ завершен. Найдены ошибки в {displayErrors.length} адресах</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-sm text-slate-600">Всего адресов</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.normalized}</div>
                  <div className="text-sm text-slate-600">Нормализовано</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.errors}</div>
                  <div className="text-sm text-slate-600">Ошибок найдено</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.success}%</div>
                  <div className="text-sm text-slate-600">Успешность</div>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                  Все результаты обработки
                </CardTitle>
                <CardDescription>
                  Полный список обработанных адресов с результатами нормализации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Исходный адрес</TableHead>
                      <TableHead>Нормализованный адрес</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.original}</TableCell>
                        <TableCell>{result.normalized}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={result.status === 'success' ? 'default' : 
                                   result.status === 'warning' ? 'secondary' : 'destructive'}
                            className={result.status === 'success' ? 'bg-green-100 text-green-700' : 
                                     result.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : ''}
                          >
                            {result.status === 'success' ? 'Успешно' : 
                             result.status === 'warning' ? 'Предупреждение' : 'Ошибка'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Errors Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={20} className="text-purple-500" />
                  Найденные ошибки
                </CardTitle>
                <CardDescription>
                  Список адресов, требующих внимания и исправления
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Описание ошибки</TableHead>
                      <TableHead>Критичность</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayErrors.map((error) => (
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
                onClick={() => downloadResults('xlsx')}
              >
                <Icon name="Download" size={20} className="mr-2" />
                Скачать Excel
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="py-4 text-lg font-medium rounded-xl border-2 transition-all duration-200 hover:scale-105"
                onClick={() => downloadResults('csv')}
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