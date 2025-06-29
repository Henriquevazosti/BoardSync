import React, { useState } from 'react';
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
      const newDate = new Date(dateValue);
      setSelectedDate(newDate);
      onChange(newDate.toISOString());
    } else {
      setSelectedDate(null);
      onChange(null);
    }
    setIsOpen(false);
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
      return date.toISOString().slice(0, 16);
    } else {
      // Para date input
      return date.toISOString().slice(0, 10);
    }
  };

  return (
    <div className="date-picker">
      {label && <label className="date-picker-label">{label}</label>}
      
      <div className={`date-picker-input ${getDateClassName()} ${disabled ? 'disabled' : ''}`}>
        <input
          type={showTime ? 'datetime-local' : 'date'}
          value={formatInputValue(selectedDate)}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
          className="date-input"
        />
        
        <div className="date-display" onClick={() => !disabled && setIsOpen(!isOpen)}>
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
        
        <span className="date-icon">📅</span>
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
