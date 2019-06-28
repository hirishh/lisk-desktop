import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import { mount } from 'enzyme';
import { tokenMap } from '../../constants/tokens';
import Bookmarks from './bookmarks';
import bookmarks from '../../../test/constants/bookmarks';

describe('Bookmarks', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      t: v => v,
      history: {
        push: jest.fn(),
      },
      bookmarkRemoved: jest.fn(),
      bookmarkUpdated: jest.fn(),
      token: {
        active: tokenMap.LSK.key,
      },
      bookmarks,
    };
    wrapper = mount(<Router><Bookmarks {...props} /></Router>);
  });

  it('should render bookmarks list', () => {
    expect(wrapper).toContainMatchingElement('.bookmarks-list');
    expect(wrapper).toContainMatchingElement('.bookmark-list-container');
    expect(wrapper).not.toContainMatchingElement('EmptyState');
  });

  it('should allow filtering bookmarks by title', () => {
    expect(wrapper).toContainMatchingElements(bookmarks.LSK.length, 'a.bookmark-list-row');
    wrapper.find('.bookmarks-filter-input').first().simulate(
      'change',
      { target: { value: bookmarks.LSK[0].title } },
    );
    expect(wrapper).toContainExactlyOneMatchingElement('a.bookmark-list-row');
  });

  it('should allow deleting a bookmark', () => {
    expect(wrapper).toContainMatchingElements(bookmarks.LSK.length, 'a.bookmark-list-row');
    wrapper.find('.bookmarks-delete-button').first().simulate('click');
    expect(props.bookmarkRemoved).toHaveBeenCalledWith({
      address: bookmarks.LSK[0].address,
      token: props.token.active,
    });
  });

  it('should allow edditing a bookmark title', () => {
    const newTitle = 'New title';
    expect(wrapper).toContainMatchingElements(bookmarks.LSK.length, 'a.bookmark-list-row');
    wrapper.find('.bookmarks-edit-button').first().simulate('click');
    jest.runAllTimers();
    wrapper.find('.bookmarks-edit-input').first().simulate(
      'change',
      { target: { value: newTitle } },
    );
    wrapper.find('.bookmarks-save-changes-button').first().simulate('click');
    expect(props.bookmarkUpdated).toHaveBeenCalledWith({
      account: {
        address: bookmarks.LSK[0].address,
        title: newTitle,
      },
      token: props.token.active,
    });
    expect(wrapper).not.toContainMatchingElement('.bookmarks-edit-input');
  });

  it('should allow to cancel edditing a bookmark title', () => {
    const newTitle = 'New title';
    expect(wrapper).toContainMatchingElements(bookmarks.LSK.length, 'a.bookmark-list-row');
    wrapper.find('.bookmarks-edit-button').first().simulate('click');
    jest.runAllTimers();
    wrapper.find('.bookmarks-edit-input').first().simulate(
      'change',
      { target: { value: newTitle } },
    );
    wrapper.find('.bookmarks-cancel-button').first().simulate('click');
    expect(props.bookmarkUpdated).not.toHaveBeenCalledWith({
      account: {
        address: bookmarks.LSK[0].address,
        title: newTitle,
      },
      token: props.token.active,
    });
    expect(wrapper).not.toContainMatchingElement('.bookmarks-edit-input');
  });
});
