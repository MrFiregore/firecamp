import { useEffect, useRef } from 'react';
import shallow from 'zustand/shallow';
import { VscNewFolder } from '@react-icons/all-files/vsc/VscNewFolder';
import { VscRefresh } from '@react-icons/all-files/vsc/VscRefresh';
import { Tree, UncontrolledTreeEnvironment } from '@firecamp/ui-kit/src/tree';
import { Pane, ToolBar, Empty } from '@firecamp/ui-kit';
import treeRenderer from './collection-tree/treeItemRenderer';
import { TreeDataProvider } from './collection-tree/TreeDataProvider';
import { useSocketStore, useSocketStoreApi } from '../../../store';
import { ISocketStore } from '../../../store/store.type';
import { TId } from '@firecamp/types';

const CollectionTab = () => {
  const treeRef = useRef();
  const { isCollectionEmpty, context, isRequestSaved } = useSocketStore(
    (s: ISocketStore) => ({
      isCollectionEmpty:
        !s.collection.folders?.length && !s.collection.items?.length,
      context: s.context,
      isRequestSaved: s.runtime.isRequestSaved,
    }),
    shallow
  );
  const {
    registerTDP,
    unRegisterTDP,
    // openPlayground,
    createFolder,
    deleteItem,
  } = useSocketStoreApi().getState() as ISocketStore;

  // console.log(items, 'items...');

  const dataProvider = useRef(new TreeDataProvider([], [], []));

  useEffect(() => {
    registerTDP(dataProvider.current);
    return unRegisterTDP;
  }, []);

  const openPlg = (plgId) => {
    // get a fresh copy of state
    // const item = items.find((i) => i.__ref.id == plgId);
    // console.log(item, 1100099);
    // openPlayground(item);
  };
  const deletePlg = (plgId: string) => {
    context.window
      .confirm({
        title: 'Are you sure to delete the playground?',
        texts: {
          btnConfirm: 'Yes, delete it.',
        },
      })
      .then((isConfirmed) => {
        if (isConfirmed) deleteItem(plgId);
      });
  };

  const _createFolderPrompt = async (parentFolderId?: TId) => {
    if (typeof parentFolderId != 'string') parentFolderId = undefined;
    if (!isRequestSaved) {
      return context.app.notify.info(
        'Please save the socket.io request first.'
      );
    }
    context.window
      .promptInput({
        header: 'Create A New Folder',
        lable: 'Folder Name',
        placeholder: '',
        texts: { btnOking: 'Creating...' },
        value: '',
        // validator: (val) => {
        //   if (!val || val.length < 3) {
        //     return {
        //       isValid: false,ß
        //       message: 'The folder name must have minimum 3 characters.',
        //     };
        //   }
        //   const isValid = RE.NoSpecialCharacters.test(val);
        //   return {
        //     isValid,
        //     message:
        //       !isValid &&
        //       'The folder name must not contain any special characters.',
        //   };
        // },
        executor: (name) => createFolder(name, parentFolderId),
        onError: (e) => {
          context.app.notify.alert(e?.response?.data?.message || e.message);
        },
      })
      .then((res) => {
        // console.log(res, 1111);
      });
  };

  return (
    <Pane
      expanded={true}
      bodyClassName={'!p-0'}
      headerTitleRenderer={() => {
        return <span>Emitter Collection</span>;
      }}
      headerActionRenderer={() => {
        return (
          <ToolBar>
            <div className="action">
              <VscRefresh size={14} className="mr-2 cursor-pointer" />
            </div>
            <div>
              <VscNewFolder
                size={14}
                className="cursor-pointer"
                onClick={() => _createFolderPrompt()}
              />
            </div>
          </ToolBar>
        );
      }}
      bodyRenderer={({ expanded }) => {
        if (isCollectionEmpty) {
          return (
            <div className="items-center">
              <Empty
                // icon={<VscFolder size="40" />}
                title="No saved emitters"
                message="This Socket.io request does not have any saved emitters.."
              />
            </div>
          );
        }

        return (
          <UncontrolledTreeEnvironment
            canRename={true}
            canReorderItems={true}
            canDragAndDrop={true}
            canDropOnFolder={true}
            keyboardBindings={{
              renameItem: ['enter', 'f2'],
              abortRenameItem: ['esc'],
            }}
            dataProvider={dataProvider.current}
            onStartRenamingItem={(a) => {
              console.log(a, 'onStartRenamingItem');
            }}
            // onSelectItems={onSelectItems}
            getItemTitle={(item) => item.data?.name}
            viewState={{}}
            renderItemArrow={treeRenderer.renderItemArrow}
            renderItem={(props) =>
              treeRenderer.renderItem({
                ...props,
                openPlg,
                deletePlg,
                createFolder: _createFolderPrompt,
              })
            }
          >
            <Tree
              treeId="fc-environment-tree"
              rootItem="root"
              treeLabel="WebSocket Message Collection"
              ref={treeRef}
            />
          </UncontrolledTreeEnvironment>
        );
      }}
    />
  );
};

export default CollectionTab;
