import { createElement, forwardRef, memo, useMemo } from 'react';
import get from 'lodash/get';
import { clearDropTarget, getAddPropsConfig, LEGO_BRIDGE, produce, STATE_PROPS, useSelector } from 'brickd-core';
import {
  CommonPropsType,
  controlUpdate,
  handleEvents,
  handlePropsClassName,
  HookState,
  propAreEqual,
  stateSelector,
} from '../common/handleFuns';
import { formatSpecialProps } from '../utils';
import merge from 'lodash/merge';
import { useHover } from '../hooks/useHover';
import { useSelect } from '../hooks/useSelect';
import { useDragDrop } from '../hooks/useDragDrop';

function NoneContainer(allProps: CommonPropsType, ref: any) {
  const {
    specialProps,
    specialProps: { key },
    ...rest
  } = allProps;
  const { componentConfigs, propsConfigSheet } = useSelector<HookState, STATE_PROPS>(stateSelector,
    (prevState, nextState) => controlUpdate(prevState, nextState, key));
  const isHovered = useHover(key);
  const { isSelected } = useSelect(specialProps);
  const {dragSource, isHidden } = useDragDrop(key);
  const { props, componentName } = componentConfigs[key] || {};
  const { propsConfig } = useMemo(() => get(LEGO_BRIDGE.config!.AllComponentConfigs, componentName), []);

  if (!componentName) return null;

  const onDragEnter = (e: Event) => {
    e.stopPropagation();
    const {dragKey}=dragSource||{}
    if(dragKey!==key){
      clearDropTarget();
    }
  };

  const { className, animateClass, ...restProps } = props || {};
  return (
    createElement(get(LEGO_BRIDGE.config!.OriginalComponents, componentName, componentName), {
      ...restProps,
      className: handlePropsClassName(isSelected, isHovered, isHidden, className, animateClass),
      ...handleEvents(specialProps, isSelected),
      onDragEnter,
      ...formatSpecialProps(props, produce(propsConfig, oldPropsConfig => {
        merge(oldPropsConfig, getAddPropsConfig(propsConfigSheet, specialProps.key));
      })),
      draggable: true,
      /**
       * 设置组件id方便抓取图片
       */
      id: isSelected ? 'select-img' : undefined,
      ref,
      ...rest,
    })
  );

}

export default memo<CommonPropsType>(forwardRef(NoneContainer), propAreEqual);
