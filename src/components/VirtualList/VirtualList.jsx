import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './VirtualList.css';

const VirtualList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // Calcular quantos itens são visíveis
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  
  // Calcular índices dos itens visíveis
  const startIndex = useMemo(() => {
    const index = Math.floor(scrollTop / itemHeight) - overscan;
    return Math.max(0, index);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    const index = startIndex + visibleItemsCount + overscan * 2;
    return Math.min(items.length - 1, index);
  }, [startIndex, visibleItemsCount, overscan, items.length]);

  // Itens visíveis
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  // Altura total virtual
  const totalHeight = items.length * itemHeight;

  // Offset do primeiro item visível
  const offsetY = startIndex * itemHeight;

  // Handler para scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Ref callback
  const refCallback = useCallback((node) => {
    if (node) {
      setContainerRef(node);
    }
  }, []);

  return (
    <div 
      ref={refCallback}
      className={`virtual-list ${className}`}
      style={{ 
        height: containerHeight,
        overflow: 'auto'
      }}
      onScroll={handleScroll}
    >
      <div 
        className="virtual-list-spacer"
        style={{ height: totalHeight }}
      >
        <div 
          className="virtual-list-content"
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'relative'
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id || startIndex + index}
              className="virtual-list-item"
              style={{ 
                height: itemHeight,
                position: 'absolute',
                top: (startIndex + index - startIndex) * itemHeight,
                left: 0,
                right: 0
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualList;
