using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for Editor_Page.xaml
    /// </summary>
    public partial class Editor_Page : Page
    {

        bool ignorecheckboxs = true;

        public Editor_Page()
        {
            InitializeComponent();
            if (Global.EditingLayer == null)
            {
                Global.SetSidebar(Global.SidebarPages.Layers);
            }
            else
            {
                prop_grid.SelectedObject = Global.EditingLayer;
            }
            ShowOnlyThis.IsChecked = Global.project.ShowOnlyThisLayer;
            BringToFront.IsChecked = Global.project.BringToFront;
            HideOverlay.IsChecked = Global.project.HideOverlay;
            ignorecheckboxs = false;
            if (Global.EditingLayer is Range_Item) HideOverlay.Visibility = Visibility.Collapsed;
            if (!(Global.EditingLayer is Range_Item) || !CheckRangeConnection())
            {
                Grid.SetRowSpan(prop_grid, 2);
                hiddenMSG.Visibility = Visibility.Collapsed;
            }
            Global.RefreshScreen();
        }

        private bool CheckRangeConnection()
        {
            foreach(Layer i in Global.project.layers) if (i.RangeSource == Global.EditingLayer) return true;
            return false;
        }

        private void Close_btn(object sender, RoutedEventArgs e)
        {
            foreach(Layer i in Global.project.layers)
            {
                if (i.RangeSource == Global.EditingLayer) i.ValidateWithSource();
            }
            Global.EditingLayer = null;
            Global.SetSidebar(Global.SidebarPages.Layers);
        }

        private void Prop_grid_PropertyValueChanged(object sender, Xceed.Wpf.Toolkit.PropertyGrid.PropertyValueChangedEventArgs e)
        {
            Global.RefreshScreen();
        }

        private void Reset_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("Do you want to restore default properties in this layer?", "Reset", MessageBoxButton.YesNo, MessageBoxImage.Warning, MessageBoxResult.No) == MessageBoxResult.Yes)
            {
                Global.EditingLayer.LoadDefaultValues();
                prop_grid.SelectedObject = null;
                prop_grid.SelectedObject = Global.EditingLayer;
                Global.RefreshScreen();
            }
        }

        private void EditorModificatorsChanged(object sender, RoutedEventArgs e)
        {
            if (ignorecheckboxs) return;
            Global.project.ShowOnlyThisLayer = (bool)ShowOnlyThis.IsChecked;
            Global.project.BringToFront = (bool)BringToFront.IsChecked;
            Global.project.HideOverlay = (bool)HideOverlay.IsChecked;
            Global.RefreshScreen();
        }
    }
}
