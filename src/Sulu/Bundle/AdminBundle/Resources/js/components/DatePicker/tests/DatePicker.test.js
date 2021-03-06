// @flow
import React from 'react';
import {mount} from 'enzyme';
import moment from 'moment-timezone';
import ReactDatetime from 'react-datetime';
import DatePicker from '../DatePicker';

beforeEach(() => {
    const constantDate = new Date(Date.UTC(2017, 3, 15, 6, 32, 20));
    (Date: any).now = jest.fn().mockReturnValue(constantDate);

    moment.tz.setDefault('Europe/Vienna');
});

test('DatePicker should render', () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker className="date-picker" onChange={onChange} value={null} />);

    expect(datePicker.render()).toMatchSnapshot();
    expect(datePicker.find('DateTime').render()).toMatchSnapshot();
});

test('DatePicker should show disabled Input when disabled', () => {
    const onChange = jest.fn();
    const value = new Date('2017-05-23');
    const datePicker = mount(<DatePicker disabled={true} onChange={onChange} value={value} />);

    expect(datePicker.find('Input').prop('onIconClick')).toEqual(undefined);
    expect(datePicker.find('Input').prop('disabled')).toEqual(true);
});

test('DatePicker should pass input to inputRef prop', () => {
    const inputRefSpy = jest.fn();
    const datePicker = mount(<DatePicker inputRef={inputRefSpy} onChange={jest.fn()} value={undefined} />);

    expect(inputRefSpy).toBeCalledWith(datePicker.find('input').instance());
});

test('DatePicker should open overlay on icon-click', () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker onChange={onChange} value={null} />);

    expect(datePicker.find('DateTime').props().open).toBeFalsy();
    datePicker.find('Icon').simulate('click');
    expect(datePicker.find('DateTime').props().open).toBeTruthy();
});

test('DatePicker should not open overlay on icon-click when disabled', () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker disabled={true} onChange={onChange} value={null} />);

    expect(datePicker.find('DateTime').props().open).toBeFalsy();
    datePicker.find('Icon').simulate('click');
    expect(datePicker.find('DateTime').props().open).toBeFalsy();
});

test('DatePicker should render with placeholder', () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker onChange={onChange} placeholder="My placeholder" value={null} />);

    expect(datePicker.find('Input').prop('placeholder')).toEqual('My placeholder');
});

test('DatePicker should render with value', () => {
    const onChange = jest.fn();
    const value = new Date('2017-05-23');
    const datePicker = mount(<DatePicker onChange={onChange} value={value} />);

    expect(datePicker.find(ReactDatetime).prop('value')).toEqual(value);
    expect(datePicker.find('Input').prop('value')).toEqual('05/23/2017');
});

test('DatePicker should try to guess incomplete value using format on blur.', () => {
    const onChangeCallback = jest.fn();
    const options = {
        dateFormat: false,
        timeFormat: 'HH:mm',
    };
    const datePicker = mount(<DatePicker onChange={onChangeCallback} options={options} value={null} />);

    const eventTarget = {
        value: '9',
    };

    datePicker.find('input').at(0).simulate('change', {target: eventTarget, currentTarget: eventTarget});
    datePicker.find('input').at(0).simulate('blur');

    expect(onChangeCallback).toBeCalledWith(expect.any(Date));

    const date = onChangeCallback.mock.calls[0][0];

    const expectedMoment = moment('09:00', options.timeFormat);
    expect(expectedMoment.isValid()).toBe(true);

    const expectedDate = expectedMoment.toDate();
    expect(date && date.getHours()).toBe(expectedDate.getHours());
    expect(date && date.getMinutes()).toBe(expectedDate.getMinutes());
});

test('DatePicker should render null value as empty string', () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker onChange={onChange} value={null} />);

    expect(datePicker.render()).toMatchSnapshot();
});

test('DatePicker should render date format only with month', () => {
    const onChange = jest.fn();
    const options = {
        dateFormat: 'MMMM',
    };
    const datePicker = mount(<DatePicker onChange={onChange} options={options} value={null} />);

    expect(datePicker.render()).toMatchSnapshot();
});

test('DatePicker should render date format only with year', () => {
    const onChange = jest.fn();
    const options = {
        dateFormat: 'YYYY',
    };
    const datePicker = mount(<DatePicker onChange={onChange} options={options} value={null} />);

    expect(datePicker.render()).toMatchSnapshot();
});

test('DatePicker should render date picker with time picker', () => {
    const onChange = jest.fn();
    const options = {
        timeFormat: true,
    };
    const datePicker = mount(<DatePicker onChange={onChange} options={options} value={null} />);

    expect(datePicker.render()).toMatchSnapshot();
    expect(datePicker.find('DateTime').render()).toMatchSnapshot();
});

test('DatePicker should render error', () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker onChange={onChange} valid={false} value={null} />);

    expect(datePicker.render()).toMatchSnapshot();
});

test('DatePicker should render error when invalid value is set', () => {
    const onChange = jest.fn();
    const options = {
        dateFormat: 'YYYY',
    };
    const datePicker = mount(<DatePicker onChange={onChange} options={options} value={null} />);

    // check if showError is set correctly
    datePicker.find('Input').instance().props.onChange('xxx', {target: {value: 'xxx'}});
    datePicker.find('Input').instance().props.onBlur();
    datePicker.update();
    expect(datePicker.instance().showError).toBe(true);

    // snapshot
    expect(datePicker.render()).toMatchSnapshot();

    // now add a valid value
    datePicker.find('Input').instance().props.onChange('2018', {target: {value: '2018'}});
    datePicker.find('Input').instance().props.onBlur();
    datePicker.update();
    expect(datePicker.instance().showError).toBe(false);
});

test('DatePicker should set class correctly when overlay was opened/closed', () => {
    const onChange = jest.fn();
    const input = mount(<DatePicker onChange={onChange} value={null} />);

    // overlay should be closed
    expect(input.find('div.rdt').hasClass('rdtOpen')).toBe(false);

    // open dialog and check if class is set
    input.find('Input Icon span').simulate('click');
    expect(input.find('div.rdt').hasClass('rdtOpen')).toBe(true);

    // choose a date and check if class was removed again
    input.find('.rdtPicker tbody tr td').first().simulate('click');
    expect(input.find('div.rdt').hasClass('rdtOpen')).toBe(false);

    // check if value is in input
    expect(input.find('Input').prop('value')).toBe('03/26/2017');
});
