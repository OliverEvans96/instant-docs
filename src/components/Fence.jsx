import { Fragment } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import Highlight, { defaultProps } from 'prism-react-renderer'
import { useState } from 'react';


export function Fence({ children, language, showCopy }) {
  const [copyLabel, setCopyLabel] = useState('Copy')
  console.log("showCopy", showCopy);
  return (
    <Highlight
      {...defaultProps}
      code={children.trimEnd()}
      language={language}
      theme={undefined}
    >
      {({ className, style, tokens, getTokenProps }) => (
        <div>
          {showCopy &&
            <div className="flex justify-end">
              <CopyToClipboard text={children}>
                <button
                  onClick={() => {
                    setCopyLabel('Copied!')
                    setTimeout(() => {
                      setCopyLabel('Copy')
                    }, 2000)
                  }}
                  className="flex items-center gap-x-1
            rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <ClipboardCopyIcon className="-ml-0.5 h-4 w-4" aria-hidden="true" />{copyLabel}</button>
              </CopyToClipboard>
            </div>
          }
          <pre className={className} style={style}>
            <code>
              {tokens.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {line
                    .filter((token) => !token.empty)
                    .map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  {'\n'}
                </Fragment>
              ))}
            </code>
          </pre>
        </div>

      )
      }
    </Highlight >
  )
}
