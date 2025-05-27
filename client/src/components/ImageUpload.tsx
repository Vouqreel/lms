import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
  maxSize?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  className,
  maxSize = 5
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
      return false;
    }

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Размер файла не должен превышать ${maxSize}MB`);
      return false;
    }

    return true;
  }, [maxSize]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (validateFile(file)) {
      onChange(file);
    }
  }, [onChange, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className={cn('w-full', className)}>
      {!value || !(value instanceof File) ? (
        <Card 
          className={cn(
            'border-2 border-dashed transition-all duration-200 cursor-pointer bg-customgreys-darkGrey',
            'hover:border-primary-500 hover:bg-customgreys-primarybg',
            dragActive ? 'border-primary-500 bg-customgreys-primarybg' : 'border-customgreys-dirtyGrey',
            error ? 'border-red-500' : ''
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
              dragActive ? 'bg-primary-500/20' : 'bg-customgreys-primarybg'
            )}>
              <Upload className={cn(
                'w-8 h-8',
                dragActive ? 'text-primary-500' : 'text-customgreys-dirtyGrey'
              )} />
            </div>
            
            <h3 className="text-lg font-medium text-white-100 mb-2">
              Загрузите изображение курса
            </h3>
            
            <p className="text-sm text-customgreys-dirtyGrey mb-4">
              Перетащите изображение сюда или нажмите для выбора
            </p>
            
            <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey">
              <span>JPEG, PNG, GIF, WebP</span>
              <span>•</span>
              <span>До {maxSize}MB</span>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 border-customgreys-dirtyGrey text-customgreys-dirtyGrey hover:bg-primary-700 hover:text-white hover:border-primary-700"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Выбрать файл
            </Button>
            
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-customgreys-dirtyGrey bg-customgreys-primarybg">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Image
                  src={value instanceof File ? URL.createObjectURL(value) : ''}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg border border-customgreys-dirtyGrey"
                />
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white-100 truncate">
                  {value instanceof File ? value.name : 'Файл'}
                </h4>
                <p className="text-xs text-customgreys-dirtyGrey mt-1">
                  {value instanceof File ? (value.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                </p>
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Готово к загрузке
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-customgreys-dirtyGrey hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
};
