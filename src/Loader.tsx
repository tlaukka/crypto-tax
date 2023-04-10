import React from 'react'
import { default as Spinner } from 'react-loader-spinner'
import Colors from './Colors'

function BaseLoader ({ type = 'Oval', ...rest }: any) {
  return <Spinner type={type} color={Colors.border} {...rest} />
}

function withSize (size: number) {
  return function (BaseComponent: typeof BaseLoader) {
    return function (props: any) {
      return <BaseComponent {...props} width={size} height={size} />
    }
  }
}

const Loader = {
  Small: withSize(24)(BaseLoader),
  Medium: withSize(32)(BaseLoader),
  Large: withSize(42)(BaseLoader)
}

export default Loader
