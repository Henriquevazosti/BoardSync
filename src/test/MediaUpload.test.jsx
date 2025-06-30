import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaUpload from '../components/MediaUpload/MediaUpload';

describe('MediaUpload', () => {
  it('should render upload area', () => {
    const mockOnFilesSelected = vi.fn();
    const mockOnRemoveFile = vi.fn();
    
    render(
      <MediaUpload 
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
        selectedFiles={[]}
      />
    );
    
    expect(screen.getByText(/Clique para selecionar arquivos/)).toBeInTheDocument();
    expect(screen.getByText(/Imagens, vídeos, PDFs/)).toBeInTheDocument();
  });

  it('should show selected files', () => {
    const mockOnFilesSelected = vi.fn();
    const mockOnRemoveFile = vi.fn();
    
    const mockFile = {
      id: 1,
      name: 'test.jpg',
      size: 1024,
      type: 'image',
      url: 'blob:test-url'
    };
    
    render(
      <MediaUpload 
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
        selectedFiles={[mockFile]}
      />
    );
    
    expect(screen.getByText('Arquivos anexados (1)')).toBeInTheDocument();
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });

  it('should call onRemoveFile when remove button is clicked', () => {
    const mockOnFilesSelected = vi.fn();
    const mockOnRemoveFile = vi.fn();
    
    const mockFile = {
      id: 1,
      name: 'test.jpg',
      size: 1024,
      type: 'image',
      url: 'blob:test-url'
    };
    
    render(
      <MediaUpload 
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
        selectedFiles={[mockFile]}
      />
    );
    
    const removeButton = screen.getByRole('button', { name: /remover arquivo/i });
    fireEvent.click(removeButton);
    
    expect(mockOnRemoveFile).toHaveBeenCalledWith(1);
  });
});
