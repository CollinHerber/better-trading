// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

//Utilities
import ExtensionBackground from 'better-trading/services/extension-background';

interface Args {
  onCancel: () => void;
  submitTask: any;
}
//
// interface PastebinCode {
//   code: string;
// }

export default class FolderImport extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('extension-background')
  extensionBackground: ExtensionBackground;

  @tracked
  stagedFolder: BookmarksFolderStruct | null = null;

  @tracked
  stagedTrades: BookmarksTradeStruct[] = [];

  @tracked
  isInvalid: boolean = false;

  get canSubmit() {
    return Boolean(this.stagedFolder);
  }

  get submitEntity() {
    return {
      folder: this.stagedFolder,
      trades: this.stagedTrades,
    };
  }

  @action
  handleInput(input: string) {
    this.updateFolder(input);
  }

  @action
  async handlePastebin(input: string) {
    console.log(input);
    if (!input.includes("https://pastebin.com")) {
      window.alert('This is not a pastebin link');
      return;
    }

    try {
      let splitInput = input.split('/');
      let binId = splitInput[splitInput.length - 1];
      console.log('binId' , binId);
      const code = await this.extensionBackground.fetchPastebinResource(binId);
      console.log('code' , code);

      if (code) {
        this.updateFolder(code);
      }
    } catch(e) {
      console.log(e);
    }
  }

  updateFolder(code: any) {
    const result = this.bookmarks.deserializeFolder(code);
    if (result) {
      const [folder, trades] = result;

      this.isInvalid = false;
      this.stagedFolder = folder;
      this.stagedTrades = trades;
    } else {
      this.isInvalid = true;
      this.stagedFolder = null;
      this.stagedTrades = [];
    }
  }
}
