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
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for NewItemWindow.xaml
    /// </summary>
    public partial class NewItemWindow : Window
    {

        const string ERR_NAME = "Layer must have a name!";
        const string ERR_SOURCE = "This layer must have a range source!";

        Global.LayersType itemSelected = Global.LayersType.Range;
        List<Layer> RefList = new List<Layer>();

        public NewItemWindow()
        {
            InitializeComponent();
            LoadItemsList();
            LoadRangeList();
            lbl_err_name.Content = "";
            lbl_err_source.Content = "";
            txt_name.Text = "New Layer";
            txt_name.Focus();
            txt_name.SelectionStart = 0;
            txt_name.SelectionLength = txt_name.Text.Length;
        }

        private void LoadItemsList()
        {

        }

        private void LoadRangeList()
        {
            RangeItemsList.Items.Clear();
            RefList.Clear();
            foreach(Layer i in Global.project.layers)
            {
                if (i is Range_Item)
                {
                    RefList.Add(i);
                    RangeItemsList.Items.Add(i.Label);
                }
            }
            if (RangeItemsList.Items.Count == 1) RangeItemsList.SelectedIndex = 0;
        }

        private void Cancel_btn(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
        }

        private void Ok_btn_Click(object sender, RoutedEventArgs e)
        {
            Layer newItem = (Layer)Activator.CreateInstance(Global.GetLayerObject(itemSelected));
            newItem.Label = txt_name.Text;
            if (itemSelected != Global.LayersType.Range) newItem.SetRangeSource(RefList[RangeItemsList.SelectedIndex]);
            Global.project.layers.Insert(0, newItem);
            DialogResult = true;
        }

        private void ValidateOperation()
        {
            bool approved = true;
            lbl_err_name.Content = "";
            lbl_err_source.Content = "";
            if (txt_name.Text.Length == 0)
            {
                lbl_err_name.Content = ERR_NAME;
                approved = false;
            }
            if (itemSelected != Global.LayersType.Range && RangeItemsList.SelectedIndex < 0)
            {
                lbl_err_source.Content = ERR_SOURCE;
                approved = false;
            }
            ok_btn.IsEnabled = approved;
        }

        private void RangeItemsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ValidateOperation();
        }

        private void Txt_name_TextChanged(object sender, TextChangedEventArgs e)
        {
            ValidateOperation();
        }
    }
}
