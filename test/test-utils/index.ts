/* eslint-disable no-process-env */
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import chaiExclude from 'chai-exclude'
import * as dirtyChai from 'dirty-chai'
import { createSandbox } from 'sinon'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { StubbedClass, stubClass } from './types'
import { StubbedType, stubInterface } from '@salesforce/ts-sinon'
import * as apm from 'elastic-apm-node'
import { setAPMInstance } from '../../src/utils/monitoring/apm.init'
import { buildTestingModuleForHttpTesting } from './module-for-testing'

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(chaiExclude)
chai.use(dirtyChai)

const expect = chai.expect
export { createSandbox, expect, sinon }

export { stubClass, StubbedClass }

export { buildTestingModuleForHttpTesting }

const instanceMock: StubbedType<apm.Agent> = stubInterface(createSandbox())
setAPMInstance(instanceMock)
