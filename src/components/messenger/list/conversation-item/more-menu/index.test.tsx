import React from 'react';
import { shallow } from 'enzyme';
import { Properties, MoreMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

describe(MoreMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isFavorite: false,
      onFavorite: () => {},
      ...props,
    };

    return shallow(<MoreMenu {...allProps} />);
  };

  describe('Favorite menu item', () => {
    it('fires onFavorite event when selected', function () {
      const onFavorite = jest.fn();

      selectItem(subject({ onFavorite }), 'favorite');

      expect(onFavorite).toHaveBeenCalled();
    });

    it('should display "Unfavorite" label when isFavorite is true', () => {
      const wrapper = subject({ isFavorite: true });

      const favoriteItem = menuItem(wrapper, 'favorite');

      expectLabelToContainText(favoriteItem, 'Unfavorite');
    });

    it('should display "Favorite" label when isFavorite is false', () => {
      const wrapper = subject({ isFavorite: false });

      const favoriteItem = menuItem(wrapper, 'favorite');

      expectLabelToContainText(favoriteItem, 'Favorite');
    });
  });
});

function selectItem(wrapper, id) {
  menuItem(wrapper, id).onSelect();
}

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}

function expectLabelToContainText(item, expectedText) {
  const label = shallow(item.label);
  expect(label.text()).toContain(expectedText);
}