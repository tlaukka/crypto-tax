import React from 'react'
import { default as Spinner } from 'react-loader-spinner'
import Colors from './Colors'

function BaseLoader (props) {
  return <Spinner type={'Oval'} color={Colors.border} {...props} />
}

function withSize (size) {
  return function (BaseComponent) {
    return function (props) {
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
