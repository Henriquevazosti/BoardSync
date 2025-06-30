import React, { useState, useRef } from 'react';
import './DatePicker.css';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Selecionar data...",
  label,
  showTime = false,
  clearable = true,
  disabled = false,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const inputRef = useRef(null);

  // Função para formatar data para exibição
  const formatDisplayDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Verifica se é hoje
    if (dateToCheck.getTime() === today.getTime()) {
      return showTime ? `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Hoje';
    }
    
    // Verifica se é amanhã
    if (dateToCheck.getTime() === tomorrow.getTime()) {
      return showTime ? `Amanhã às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Amanhã';
    }
    
    // Formato padrão
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    };
    
    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('pt-BR', options);
  };

  // Função para verificar se a data está vencida
  const isOverdue = (date) => {
    if (!date) return false;
    const now = new Date();
    return date < now;
  };

  // Função para verificar se vence hoje
  const isDueToday = (date) => {
    if (!date) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateToCheck.getTime() === today.getTime();
  };

  // Função para verificar se vence em breve (próximos 3 dias)
  const isDueSoon = (date) => {
    if (!date) return false;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return date <= threeDaysFromNow && date > now;
  };

  const handleDateChange = (event) => {
    const dateValue = event.target.value;
    if (dateValue) {
      let newDate;
      if (showTime) {
        // Para datetime-local, o valor já está no timezone local
        newDate = new Date(dateValue);
      } else {
        // Para date input, precisamos garantir que seja interpretado como timezone local
        // O input date retorna no formato YYYY-MM-DD
        const [year, month, day] = dateValue.split('-').map(Number);
        newDate = new Date(year, month - 1, day); // month é 0-indexed
      }
      setSelectedDate(newDate);
      onChange(newDate.toISOString());
    } else {
      setSelectedDate(null);
      onChange(null);
    }
  };

  const handleDisplayClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
      // Tentar usar showPicker se disponível (navegadores modernos)
      try {
        if (inputRef.current.showPicker) {
          inputRef.current.showPicker();
        } else {
          // Fallback para navegadores mais antigos
          inputRef.current.click();
        }
      } catch (error) {
        // Se showPicker falhar, usar click como fallback
        inputRef.current.click();
      }
    }
  };

  const handleIconClick = (e) => {
    console.log('Ícone clicado!', { disabled, inputRef: inputRef.current });
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && inputRef.current) {
      try {
        // Forçar focus e clique no input
        inputRef.current.focus();
        inputRef.current.click();
        
        console.log('Input focado e clicado');
        
        // Tentar showPicker se disponível
        if (inputRef.current.showPicker) {
          inputRef.current.showPicker();
          console.log('showPicker executado');
        } else {
          console.log('showPicker não disponível');
        }
      } catch (error) {
        console.error('Erro ao abrir date picker:', error);
      }
    } else {
      console.log('Condições não atendidas:', { disabled, hasInput: !!inputRef.current });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange(null);
  };

  const getDateClassName = () => {
    if (!selectedDate) return '';
    
    if (isOverdue(selectedDate)) return 'overdue';
    if (isDueToday(selectedDate)) return 'due-today';
    if (isDueSoon(selectedDate)) return 'due-soon';
    return '';
  };

  const formatInputValue = (date) => {
    if (!date) return '';
    
    if (showTime) {
      // Para datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
      // Para date input - usar componentes locais da data
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  return (
    <div className="date-picker">
      {label && <label className="date-picker-label">{label}</label>}
      
      <div className={`date-picker-input ${getDateClassName()} ${disabled ? 'disabled' : ''}`}>
        <input
          ref={inputRef}
          type={showTime ? 'datetime-local' : 'date'}
          value={formatInputValue(selectedDate)}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
          className="date-input"
        />
        
        <div className="date-display">
          {selectedDate ? (
            <span className={`date-text ${getDateClassName()}`}>
              {formatDisplayDate(selectedDate)}
            </span>
          ) : (
            <span className="date-placeholder">{placeholder}</span>
          )}
          
          {selectedDate && clearable && !disabled && (
            <button
              type="button"
              className="clear-date-btn"
              onClick={handleClear}
              title="Remover data"
            >
              ×
            </button>
          )}
        </div>
        
        <button 
          type="button"
          className="date-icon-btn" 
          onClick={handleIconClick} 
          title="Selecionar data"
          disabled={disabled}
        >
          📅
        </button>
      </div>

      {/* Indicadores visuais */}
      {selectedDate && (
        <div className="date-indicators">
          {isOverdue(selectedDate) && (
            <span className="date-indicator overdue" title="Vencido">
              ⚠️ Vencido
            </span>
          )}
          {isDueToday(selectedDate) && (
            <span className="date-indicator due-today" title="Vence hoje">
              🔔 Vence hoje
            </span>
          )}
          {isDueSoon(selectedDate) && !isDueToday(selectedDate) && (
            <span className="date-indicator due-soon" title="Vence em breve">
              ⏰ Vence em breve
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
